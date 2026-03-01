const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get real dashboard statistics
router.get('/stats', protect, async (req, res) => {
    try {
        const dealerId = req.user._id;

        // Get all invoices for this dealer
        const allInvoices = await Invoice.find({ dealer: dealerId }).sort({ createdAt: -1 });

        // Total revenue (from generated invoices only)
        const generatedInvoices = allInvoices.filter(i => i.status === 'generated');
        const totalRevenue = generatedInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

        // Total GST collected
        const totalGst = generatedInvoices.reduce((sum, inv) => sum + (inv.totalGst || 0), 0);

        // Invoice status counts
        const statusCounts = {
            generated: allInvoices.filter(i => i.status === 'generated').length,
            draft: allInvoices.filter(i => i.status === 'draft').length,
            cancelled: allInvoices.filter(i => i.status === 'cancelled').length,
        };

        // Customer count
        const customerCount = await Customer.countDocuments({ dealer: dealerId });

        // Products
        const products = await Product.find({ dealer: dealerId });
        const activeProducts = products.filter(p => p.status === 'active');
        const totalStock = activeProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
        const lowStockProducts = activeProducts.filter(p => p.stock <= 5);

        // Monthly revenue data (last 12 months)
        const now = new Date();
        const monthlyRevenue = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

            const monthInvoices = generatedInvoices.filter(inv => {
                const created = new Date(inv.createdAt);
                return created >= monthStart && created <= monthEnd;
            });

            monthlyRevenue.push({
                month: monthNames[d.getMonth()],
                revenue: Math.round(monthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)),
            });
        }

        // Recent invoices (last 10)
        const recentInvoices = allInvoices.slice(0, 10).map(inv => ({
            _id: inv._id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            grandTotal: inv.grandTotal,
            status: inv.status,
            createdAt: inv.createdAt,
        }));

        res.json({
            success: true,
            stats: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalGst: Math.round(totalGst * 100) / 100,
                totalInvoices: allInvoices.length,
                statusCounts,
                customerCount,
                totalProducts: activeProducts.length,
                totalStock,
                lowStockProducts: lowStockProducts.map(p => ({
                    _id: p._id,
                    name: p.name,
                    stock: p.stock,
                    images: p.images,
                })),
                monthlyRevenue,
                recentInvoices,
            },
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
