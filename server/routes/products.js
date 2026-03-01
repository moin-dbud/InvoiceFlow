const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { uploadToR2 } = require('../utils/uploadR2');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        cb(null, allowed.includes(file.mimetype));
    },
});

// @route   GET /api/products
// @desc    Get all products for the logged-in dealer
router.get('/', protect, async (req, res) => {
    try {
        const { search, status } = req.query;
        const filter = { dealer: req.user._id };

        if (status && ['active', 'inactive'].includes(status)) {
            filter.status = status;
        }

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });

        res.json({ success: true, count: products.length, products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
router.get('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, dealer: req.user._id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/products
// @desc    Create a new product
router.post('/', protect, upload.array('images', 3), async (req, res) => {
    try {
        const { name, basePrice, description, batteryCapacity, range, stock, status } = req.body;

        // Upload images to R2
        const imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadToR2(file.buffer, file.originalname, 'products');
                imageUrls.push(url);
            }
        }

        const product = await Product.create({
            dealer: req.user._id,
            name,
            basePrice: Number(basePrice),
            description: description || '',
            images: imageUrls,
            batteryCapacity: batteryCapacity ? Number(batteryCapacity) : null,
            range: range ? Number(range) : null,
            stock: Number(stock) || 0,
            status: status || 'active',
        });

        res.status(201).json({ success: true, product });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
router.put('/:id', protect, upload.array('images', 3), async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, dealer: req.user._id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const { name, basePrice, description, batteryCapacity, range, stock, status, existingImages } = req.body;

        // Keep existing images that weren't removed
        let imageUrls = [];
        if (existingImages) {
            imageUrls = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
        }

        // Upload new images
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadToR2(file.buffer, file.originalname, 'products');
                imageUrls.push(url);
            }
        }

        // Limit to 3 images
        imageUrls = imageUrls.slice(0, 3);

        product.name = name || product.name;
        product.basePrice = basePrice !== undefined ? Number(basePrice) : product.basePrice;
        product.description = description !== undefined ? description : product.description;
        product.images = imageUrls;
        product.batteryCapacity = batteryCapacity !== undefined ? (batteryCapacity ? Number(batteryCapacity) : null) : product.batteryCapacity;
        product.range = range !== undefined ? (range ? Number(range) : null) : product.range;
        product.stock = stock !== undefined ? Number(stock) : product.stock;
        product.status = status || product.status;

        await product.save();

        res.json({ success: true, product });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Deactivate (soft delete) a product
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, dealer: req.user._id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.status = 'inactive';
        await product.save();

        res.json({ success: true, message: 'Product deactivated' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
