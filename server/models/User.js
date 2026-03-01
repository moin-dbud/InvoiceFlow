const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        showroomName: {
            type: String,
            required: [true, 'Please provide showroom name'],
            trim: true,
            maxlength: [100, 'Showroom name cannot exceed 100 characters'],
        },
        gstin: {
            type: String,
            required: [true, 'Please provide GSTIN'],
            unique: true,
            trim: true,
            match: [
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                'Please provide a valid 15-character GSTIN',
            ],
        },
        address: {
            type: String,
            required: [true, 'Please provide address'],
            trim: true,
        },
        contactNumber: {
            type: String,
            required: [true, 'Please provide contact number'],
            unique: true,
            trim: true,
            match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        dealerLogo: {
            type: String,
            default: '',
        },
        digitalSignature: {
            type: String,
            default: '',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            code: { type: String, select: false },
            expiresAt: { type: Date, select: false },
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT
userSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Generate OTP
userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = {
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
    };
    return otp;
};

module.exports = mongoose.model('User', userSchema);
