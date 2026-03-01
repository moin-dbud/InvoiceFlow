const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
    {
        dealer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        mobile: {
            type: String,
            required: [true, 'Mobile number is required'],
            trim: true,
        },
        address: {
            type: String,
            trim: true,
            default: '',
        },
        totalSpend: {
            type: Number,
            default: 0,
        },
        invoiceCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Compound index for unique customer per dealer by mobile
customerSchema.index({ dealer: 1, mobile: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
