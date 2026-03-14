import { useRef, useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { X, Download, Printer, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import InvoiceTemplate from './InvoiceTemplate';
import axios from 'axios';
import { imageUrlToBase64 } from '../utils/imageUtils';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export default function InvoicePreviewModal({ invoice, onClose }) {
    const templateRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [dealer, setDealer] = useState(null);
    const [downloadDone, setDownloadDone] = useState(false);
    const [pdfError, setPdfError] = useState('');

    // Fetch full dealer info (includes address, GSTIN etc.)
    useEffect(() => {
        const fetchDealer = async () => {
            try {
                const { data } = await axios.get(`${API}/auth/me`, authHeader());
                if (data.success) setDealer(data.user);
            } catch { /* silently ignore */ }
        };
        fetchDealer();
    }, []);

    /**
     * Core PDF generation.
     *
     * Step 1: Convert every <img> src to a Base64 data URI (via server proxy for
     *         cross-origin R2 URLs). This eliminates canvas taint from CORS.
     * Step 2: html2canvas captures the template — all images are now data: URIs.
     * Step 3: Restore original src values, build and save PDF.
     */
    const generatePDF = async () => {
        const el = templateRef.current;
        if (!el) throw new Error('Template element not mounted');

        const imgs = Array.from(el.querySelectorAll('img'));
        const originalSrcs = imgs.map(img => img.src);

        console.log('[PDF] Found', imgs.length, 'images to convert');
        console.log('[PDF] Image srcs:', originalSrcs);

        // Convert every image to Base64 via proxy
        const base64Srcs = await Promise.all(
            originalSrcs.map(async (src, idx) => {
                const b64 = await imageUrlToBase64(src);
                console.log(`[PDF] Image ${idx}: ${b64 ? 'converted ✅' : 'FAILED ❌'} — ${src.slice(0, 60)}`);
                return b64;
            })
        );

        // Transparent 1×1 pixel PNG — used as placeholder when conversion fails
        // so the canvas is never tainted by a cross-origin URL
        const BLANK_PX = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

        // Swap img srcs to Base64 (use blank pixel if conversion failed)
        imgs.forEach((img, i) => {
            img.src = base64Srcs[i] || BLANK_PX;
        });

        // Let browser repaint with updated src values
        await new Promise(r => setTimeout(r, 200));

        let canvas;
        try {
            canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,       // safe belt-and-suspenders
                allowTaint: false,   // prevent taint — all srcs are now data: or blank
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 15000,
            });
        } finally {
            // ALWAYS restore original src values, even if html2canvas throws
            imgs.forEach((img, i) => { img.src = originalSrcs[i]; });
        }

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth  = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
        const w = canvas.width  * ratio;
        const h = canvas.height * ratio;
        const x = (pdfWidth - w) / 2;

        pdf.addImage(imgData, 'PNG', x, 0, w, h);
        return pdf;
    };

    const handleDownload = async () => {
        setDownloading(true);
        setPdfError('');
        try {
            const pdf = await generatePDF();
            pdf.save(`${invoice.invoiceNumber}.pdf`);
            setDownloadDone(true);
            setTimeout(() => setDownloadDone(false), 3000);
        } catch (err) {
            console.error('[PDF] Generation failed:', err);
            setPdfError(`PDF failed: ${err.message}`);
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        setPrinting(true);
        try {
            const el = templateRef.current;
            if (!el) return;
            const printWindow = window.open('', '_blank', 'width=900,height=700');
            printWindow.document.write(`
                <!DOCTYPE html><html>
                <head>
                    <title>${invoice.invoiceNumber}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; }
                        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                    </style>
                </head>
                <body>${el.innerHTML}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
        } catch (err) {
            console.error('Print error:', err);
        } finally {
            setPrinting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-6 px-4"
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-[860px] my-auto">

                {/* Action Bar */}
                <div className="bg-[#12121f] border border-white/10 rounded-2xl p-5 mb-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            Invoice Generated
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {invoice.invoiceNumber} — ₹{invoice.grandTotal.toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        {/* Download PDF */}
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleDownload} disabled={downloading || !dealer}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-60 transition-all">
                            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {downloading ? 'Generating…' : downloadDone ? 'Downloaded!' : 'Download PDF'}
                        </motion.button>

                        {/* Print */}
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handlePrint} disabled={printing || !dealer}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-60 transition-all">
                            {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                            Print Invoice
                        </motion.button>
                    </div>

                    <button onClick={onClose}
                        className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* PDF error banner */}
                {pdfError && (
                    <div className="flex items-center gap-2 px-4 py-3 mb-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {pdfError}
                    </div>
                )}

                {/* Invoice Preview */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                    style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                    {!dealer ? (
                        <div className="flex items-center justify-center py-32">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : (
                        <InvoiceTemplate
                            ref={templateRef}
                            invoice={invoice}
                            dealer={dealer}
                        />
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
