const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

/**
 * GET /api/proxy/image?url=<encoded_url>
 *
 * Server-side image proxy. Fetches images from Cloudflare R2 (or any allowed
 * CDN) and pipes them back with proper CORS headers. This bypasses browser CORS
 * restrictions that would block html2canvas from converting CDN images to Base64.
 *
 * Only URLs that start with the configured R2_PUBLIC_URL are allowed (security).
 * Also allows local /assets/* paths for completeness.
 */
router.get('/image', protect, async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ success: false, message: 'url query parameter is required' });
    }

    // Security: only allow R2 URLs (or empty R2_PUBLIC_URL in dev = allow all)
    const decodedUrl = decodeURIComponent(url);
    if (R2_PUBLIC_URL && !decodedUrl.startsWith(R2_PUBLIC_URL)) {
        return res.status(403).json({ success: false, message: 'URL not permitted by proxy' });
    }

    try {
        const response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'InvoiceFlow-ImageProxy/1.0',
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message: `Upstream returned ${response.status}`,
            });
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = Buffer.from(await response.arrayBuffer());

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 1 day
        res.setHeader('Access-Control-Allow-Origin', '*');        // allow browser fetch
        res.send(buffer);
    } catch (err) {
        console.error('[proxy/image] fetch error:', err.message);
        res.status(502).json({ success: false, message: 'Failed to fetch image from upstream' });
    }
});

module.exports = router;
