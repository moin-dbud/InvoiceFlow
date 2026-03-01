const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Generate invoice number
async function generateInvoiceNumber(dealerId) {
    const count = await Invoice.countDocuments({ dealer: dealerId });
    const num = String(count + 1).padStart(4, '0');
    return `INV-${num}`;
}

// @route   GET /api/invoices
router.get('/', protect, async (req, res) => {
    try {
        const { search, status, startDate, endDate } = req.query;
        const filter = { dealer: req.user._id };

        if (status && status !== 'all') filter.status = status;
        if (search) {
            filter.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
            ];
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }

        const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, invoices });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/invoices/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, dealer: req.user._id }).populate('customer');
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        res.json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/invoices
router.post('/', protect, async (req, res) => {
    try {
        const {
            customerName, customerMobile, customerAddress,
            lineItems, gstEnabled, gstRate, paymentMode, status
        } = req.body;

        // Find or create customer
        let customer = await Customer.findOne({ dealer: req.user._id, mobile: customerMobile });
        if (!customer) {
            customer = await Customer.create({
                dealer: req.user._id,
                name: customerName,
                mobile: customerMobile,
                address: customerAddress || '',
            });
        } else {
            if (customerName) customer.name = customerName;
            if (customerAddress) customer.address = customerAddress;
            await customer.save();
        }

        // Calculate totals
        let subTotal = 0;
        let totalDiscount = 0;
        const processedItems = lineItems.map(item => {
            const base = item.basePrice * item.quantity;
            let discountAmt = 0;
            if (item.discountType === 'percentage') {
                discountAmt = (base * item.discountValue) / 100;
            } else {
                discountAmt = item.discountValue || 0;
            }
            const lineTotal = base - discountAmt;
            subTotal += lineTotal;
            totalDiscount += discountAmt;
            return { ...item, discountAmount: discountAmt, lineTotal };
        });

        // GST
        let cgst = 0, sgst = 0, igst = 0, totalGst = 0;
        const rate = gstEnabled ? (gstRate || 0) : 0;
        if (rate > 0) {
            cgst = (subTotal * rate) / 200;
            sgst = (subTotal * rate) / 200;
            totalGst = cgst + sgst;
        }

        const grandTotal = subTotal + totalGst;
        const invoiceNumber = await generateInvoiceNumber(req.user._id);

        const invoice = await Invoice.create({
            dealer: req.user._id,
            invoiceNumber,
            customer: customer._id,
            customerName,
            customerMobile,
            customerAddress: customerAddress || '',
            lineItems: processedItems,
            subTotal: Math.round(subTotal * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            gstEnabled: !!gstEnabled,
            gstRate: rate,
            cgst: Math.round(cgst * 100) / 100,
            sgst: Math.round(sgst * 100) / 100,
            igst: Math.round(igst * 100) / 100,
            totalGst: Math.round(totalGst * 100) / 100,
            grandTotal: Math.round(grandTotal * 100) / 100,
            paymentMode: paymentMode || 'cash',
            status: status || 'generated',
        });

        // Update customer stats if generated (not draft)
        if (invoice.status === 'generated') {
            customer.totalSpend += invoice.grandTotal;
            customer.invoiceCount += 1;
            await customer.save();

            // Decrement stock
            for (const item of lineItems) {
                if (item.product) {
                    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
                }
            }
        }

        res.status(201).json({ success: true, invoice });
    } catch (error) {
        console.error('Create invoice error:', error);
        if (error.name === 'ValidationError') {
            const msg = Object.values(error.errors).map(e => e.message)[0];
            return res.status(400).json({ success: false, message: msg });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/invoices/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, dealer: req.user._id });
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        if (invoice.status === 'cancelled') return res.status(400).json({ success: false, message: 'Already cancelled' });

        // Reverse customer stats if was generated
        if (invoice.status === 'generated') {
            await Customer.findByIdAndUpdate(invoice.customer, {
                $inc: { totalSpend: -invoice.grandTotal, invoiceCount: -1 },
            });
            // Restore stock
            for (const item of invoice.lineItems) {
                if (item.product) {
                    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
                }
            }
        }

        invoice.status = 'cancelled';
        await invoice.save();
        res.json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/invoices/:id/generate  (promote draft to generated)
router.put('/:id/generate', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, dealer: req.user._id });
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        if (invoice.status !== 'draft') return res.status(400).json({ success: false, message: 'Only drafts can be generated' });

        invoice.status = 'generated';
        await invoice.save();

        // Update customer stats
        await Customer.findByIdAndUpdate(invoice.customer, {
            $inc: { totalSpend: invoice.grandTotal, invoiceCount: 1 },
        });
        // Decrement stock
        for (const item of invoice.lineItems) {
            if (item.product) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
            }
        }

        res.json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/invoices/:id
// @desc    Permanently delete an invoice
router.delete('/:id', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, dealer: req.user._id });
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        // Reverse customer stats and restore stock if invoice was generated
        if (invoice.status === 'generated') {
            await Customer.findByIdAndUpdate(invoice.customer, {
                $inc: { totalSpend: -invoice.grandTotal, invoiceCount: -1 },
            });
            for (const item of invoice.lineItems) {
                if (item.product) {
                    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
                }
            }
        }

        await Invoice.findByIdAndDelete(invoice._id);
        res.json({ success: true, message: 'Invoice deleted' });
    } catch (error) {
        console.error('Delete invoice error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
