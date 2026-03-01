const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const { protect } = require('../middleware/auth');

// @route   GET /api/customers
router.get('/', protect, async (req, res) => {
    try {
        const { search } = req.query;
        const filter = { dealer: req.user._id };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
            ];
        }
        const customers = await Customer.find(filter).sort({ updatedAt: -1 });
        res.json({ success: true, customers });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/customers/suggest?mobile=
router.get('/suggest', protect, async (req, res) => {
    try {
        const { mobile } = req.query;
        if (!mobile || mobile.length < 3) return res.json({ success: true, customers: [] });
        const customers = await Customer.find({
            dealer: req.user._id,
            mobile: { $regex: mobile, $options: 'i' },
        }).limit(5);
        res.json({ success: true, customers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/customers/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, dealer: req.user._id });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        const invoices = await Invoice.find({ customer: customer._id, dealer: req.user._id }).sort({ createdAt: -1 });

        res.json({ success: true, customer, invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/customers/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, dealer: req.user._id });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        const { name, mobile, address } = req.body;
        if (name) customer.name = name;
        if (mobile) customer.mobile = mobile;
        if (address !== undefined) customer.address = address;
        await customer.save();

        res.json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/customers/export/csv
router.get('/export/csv', protect, async (req, res) => {
    try {
        const customers = await Customer.find({ dealer: req.user._id }).sort({ createdAt: -1 });
        const header = 'Name,Mobile,Address,Total Spend,Invoice Count,Created At\n';
        const rows = customers.map(c =>
            `"${c.name}","${c.mobile}","${c.address}",${c.totalSpend},${c.invoiceCount},${c.createdAt.toISOString()}`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
        res.send(header + rows);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/customers/:id
// @desc    Permanently delete a customer
router.delete('/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, dealer: req.user._id });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        // Check if customer has invoices
        const invoiceCount = await Invoice.countDocuments({ customer: customer._id, dealer: req.user._id });
        if (invoiceCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete — this customer has ${invoiceCount} invoice(s). Delete the invoices first.`,
            });
        }

        await Customer.findByIdAndDelete(customer._id);
        res.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
