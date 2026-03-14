// In dev (localhost), always talk to the local server.
// In production (Vercel), use VITE_API_URL which points to the deployed server.
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API = isDev
    ? 'http://localhost:5000/api'
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const getToken = () => localStorage.getItem('token');

/**
 * Fetches an image URL and converts it to a Base64 data URI.
 *
 * - Local / same-origin assets → fetched directly (no CORS issue)
 * - Remote CDN / R2 URLs       → routed through our server-side proxy
 *   (/api/proxy/image) so the server does the fetch (no browser CORS check)
 *
 * @param {string|null} url - img.src (may be absolute from browser resolution)
 * @returns {Promise<string|null>} Base64 data URI, or null on failure
 */
export async function imageUrlToBase64(url) {
    if (!url) return null;
    if (url.startsWith('data:')) return url; // already Base64

    const token = getToken();
    const origin = window.location.origin;

    try {
        let fetchUrl;

        const isLocalSrc =
            url.startsWith('/') ||
            url.startsWith(origin) ||
            url.startsWith('http://localhost') ||
            url.startsWith('http://127.0.0.1');

        if (isLocalSrc) {
            // Same-origin static asset — fetch directly
            fetchUrl = url.startsWith('/') ? `${origin}${url}` : url;
        } else {
            // Cross-origin CDN / R2 URL — proxy through our server
            fetchUrl = `${API}/proxy/image?url=${encodeURIComponent(url)}`;
        }

        const response = await fetch(fetchUrl, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} from ${fetchUrl}`);
        }

        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (err) {
        console.warn('[imageUrlToBase64] skipping:', url.slice(0, 80), '—', err.message);
        return null;
    }
}
