const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Allowed origins: local dev + production Vercel client
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL, // e.g. https://invoice-client.vercel.app
].filter(Boolean);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler (catches multer errors, etc.)
app.use((err, req, res, next) => {
    console.error('⚠️ Error:', err.message);
    if (err.name === 'MulterError') {
        return res.status(400).json({ success: false, message: `File upload error: ${err.message}` });
    }
    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message || 'Server error' });
});

// Connect to MongoDB
const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    }
};

// For local development: start the server normally
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    connectDB()
        .then(() => {
            app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
        })
        .catch((err) => {
            console.error('❌ MongoDB connection error:', err.message);
            process.exit(1);
        });
}

// For Vercel serverless: connect on each cold start then export
const handler = async (req, res) => {
    await connectDB();
    return app(req, res);
};

module.exports = handler;

