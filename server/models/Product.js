const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        dealer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [120, 'Name cannot exceed 120 characters'],
        },
        basePrice: {
            type: Number,
            required: [true, 'Base price is required'],
            min: [0, 'Price cannot be negative'],
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        images: {
            type: [String],
            default: [],
            validate: [arr => arr.length <= 3, 'Maximum 3 images allowed'],
        },
        batteryCapacity: {
            type: Number,
            default: null,
        },
        range: {
            type: Number,
            default: null,
        },
        stock: {
            type: Number,
            required: [true, 'Stock count is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
);

// Index for search
productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);
