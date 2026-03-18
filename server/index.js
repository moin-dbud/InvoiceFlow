const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ─── CORS — manual header injection (most reliable for Vercel serverless) ──────
// We inject headers on EVERY response so preflight OPTIONS never fails.
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://invoice-flow-orcin.vercel.app', // your deployed client
    process.env.CLIENT_URL,                   // fallback from env
].filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    // If the request origin is in the allowed list, reflect it back
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // No origin = curl / Postman / server-to-server: allow it
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    // Respond immediately to OPTIONS preflight — don't pass to routes
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

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

// Connect to MongoDB (lazy — reuses connection across warm invocations)
const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    }
};

// ─── Local dev: start normally ───────────────────────────────────────────────
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

// ─── Vercel serverless export ────────────────────────────────────────────────
const handler = async (req, res) => {
    await connectDB();
    return app(req, res);
};

module.exports = handler;


