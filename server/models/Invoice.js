const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    basePrice: { type: Number, required: true },
    discountType: { type: String, enum: ['flat', 'percentage'], default: 'flat' },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    lineTotal: { type: Number, required: true },
}, { _id: false });

const invoiceSchema = new mongoose.Schema(
    {
        dealer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        customerName: { type: String, required: true },
        customerMobile: { type: String, required: true },
        customerAddress: { type: String, default: '' },
        lineItems: [lineItemSchema],
        subTotal: { type: Number, required: true },
        totalDiscount: { type: Number, default: 0 },
        gstEnabled: { type: Boolean, default: false },
        gstRate: { type: Number, default: 0 },
        cgst: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        igst: { type: Number, default: 0 },
        totalGst: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true },
        paymentMode: {
            type: String,
            enum: ['cash', 'card', 'upi', 'finance', 'cheque'],
            default: 'cash',
        },
        status: {
            type: String,
            enum: ['draft', 'generated', 'cancelled'],
            default: 'draft',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
