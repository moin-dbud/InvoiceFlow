const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { uploadToR2 } = require('../utils/uploadR2');

// Multer memory storage for R2 upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

// @route   POST /api/auth/register
// @desc    Register a new dealer
router.post(
    '/register',
    upload.fields([
        { name: 'dealerLogo', maxCount: 1 },
        { name: 'digitalSignature', maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            console.log('📥 Register request:', { body: req.body, files: req.files ? Object.keys(req.files) : 'none' });
            const { showroomName, gstin, address, contactNumber, password } = req.body;

            // Check if contact number already exists
            const existingContact = await User.findOne({ contactNumber });
            if (existingContact) {
                return res.status(400).json({ success: false, message: 'Contact number already registered' });
            }

            // Check if GSTIN already exists
            const existingGstin = await User.findOne({ gstin });
            if (existingGstin) {
                return res.status(400).json({ success: false, message: 'GSTIN already registered' });
            }

            // Upload files to R2
            let dealerLogoUrl = '';
            let digitalSignatureUrl = '';

            if (req.files?.dealerLogo?.[0]) {
                const file = req.files.dealerLogo[0];
                dealerLogoUrl = await uploadToR2(file.buffer, file.originalname, 'logos');
            }

            if (req.files?.digitalSignature?.[0]) {
                const file = req.files.digitalSignature[0];
                digitalSignatureUrl = await uploadToR2(file.buffer, file.originalname, 'signatures');
            }

            // Create user
            const user = await User.create({
                showroomName,
                gstin: gstin.toUpperCase(),
                address,
                contactNumber,
                password,
                dealerLogo: dealerLogoUrl,
                digitalSignature: digitalSignatureUrl,
            });

            // Generate OTP
            const otp = user.generateOTP();
            await user.save({ validateBeforeSave: false });

            // In production, send OTP via SMS. For now, log it.
            console.log(`📱 OTP for ${contactNumber}: ${otp}`);

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please verify OTP.',
                userId: user._id,
                otp, // Remove this in production — only for testing
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map((e) => e.message);
                return res.status(400).json({ success: false, message: messages[0] });
            }
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                return res.status(400).json({ success: false, message: `${field} already exists` });
            }
            console.error('Register error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP after registration
router.post('/verify-otp', async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId).select('+otp.code +otp.expiresAt');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.otp?.code || !user.otp?.expiresAt) {
            return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
        }

        if (new Date() > user.otp.expiresAt) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        if (user.otp.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Mark verified & clear OTP
        user.isVerified = true;
        user.otp = undefined;
        await user.save({ validateBeforeSave: false });

        // Generate token
        const token = user.generateToken();

        res.json({
            success: true,
            message: 'OTP verified successfully',
            token,
            user: {
                id: user._id,
                showroomName: user.showroomName,
                gstin: user.gstin,
                contactNumber: user.contactNumber,
                dealerLogo: user.dealerLogo,
            },
        });
    } catch (error) {
        console.error('OTP verify error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otp = user.generateOTP();
        await user.save({ validateBeforeSave: false });

        console.log(`📱 Resent OTP for ${user.contactNumber}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP resent successfully',
            otp, // Remove in production
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Login with contact number + password
router.post('/login', async (req, res) => {
    try {
        const { contactNumber, password } = req.body;

        if (!contactNumber || !password) {
            return res.status(400).json({ success: false, message: 'Please provide contact number and password' });
        }

        const user = await User.findOne({ contactNumber }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid contact number or password' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: 'Account not verified. Please verify OTP first.', userId: user._id });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid contact number or password' });
        }

        const token = user.generateToken();

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                showroomName: user.showroomName,
                gstin: user.gstin,
                contactNumber: user.contactNumber,
                dealerLogo: user.dealerLogo,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', protect, async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            showroomName: req.user.showroomName,
            gstin: req.user.gstin,
            address: req.user.address,
            contactNumber: req.user.contactNumber,
            dealerLogo: req.user.dealerLogo,
            digitalSignature: req.user.digitalSignature,
        },
    });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put(
    '/profile',
    protect,
    upload.fields([
        { name: 'dealerLogo', maxCount: 1 },
        { name: 'digitalSignature', maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const { showroomName, address, contactNumber } = req.body;

            if (showroomName) user.showroomName = showroomName;
            if (address) user.address = address;
            if (contactNumber && contactNumber !== user.contactNumber) {
                const exists = await User.findOne({ contactNumber, _id: { $ne: user._id } });
                if (exists) {
                    return res.status(400).json({ success: false, message: 'Contact number already in use' });
                }
                user.contactNumber = contactNumber;
            }

            // Upload new files if provided
            if (req.files?.dealerLogo?.[0]) {
                const file = req.files.dealerLogo[0];
                user.dealerLogo = await uploadToR2(file.buffer, file.originalname, 'logos');
            }
            if (req.files?.digitalSignature?.[0]) {
                const file = req.files.digitalSignature[0];
                user.digitalSignature = await uploadToR2(file.buffer, file.originalname, 'signatures');
            }

            await user.save({ validateBeforeSave: false });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    showroomName: user.showroomName,
                    gstin: user.gstin,
                    address: user.address,
                    contactNumber: user.contactNumber,
                    dealerLogo: user.dealerLogo,
                    digitalSignature: user.digitalSignature,
                },
            });
        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);

module.exports = router;
