import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import InvoiceTemplate from './InvoiceTemplate';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export default function InvoicePreviewModal({ invoice, onClose }) {
    const templateRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [sendingWA, setSendingWA] = useState(false);
    const [dealer, setDealer] = useState(null);
    const [downloadDone, setDownloadDone] = useState(false);

    // Fetch full dealer info
    useEffect(() => {
        const fetchDealer = async () => {
            try {
                const { data } = await axios.get(`${API}/auth/me`, authHeader());
                if (data.success) setDealer(data.user);
            } catch { }
        };
        fetchDealer();
    }, []);

    const generatePDF = async () => {
        const el = templateRef.current;
        if (!el) return null;

        const canvas = await html2canvas(el, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const w = imgWidth * ratio;
        const h = imgHeight * ratio;
        const x = (pdfWidth - w) / 2;

        pdf.addImage(imgData, 'PNG', x, 0, w, h);
        return pdf;
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const pdf = await generatePDF();
            if (pdf) {
                pdf.save(`${invoice.invoiceNumber}.pdf`);
                setDownloadDone(true);
                setTimeout(() => setDownloadDone(false), 3000);
            }
        } catch (err) {
            console.error('PDF generation error:', err);
        } finally {
            setDownloading(false);
        }
    };

    const handleWhatsApp = async () => {
        setSendingWA(true);
        try {
            const pdf = await generatePDF();
            if (pdf) {
                // Download the PDF first
                pdf.save(`${invoice.invoiceNumber}.pdf`);

                // Then open WhatsApp with the customer's number
                const phone = invoice.customerMobile.startsWith('+91')
                    ? invoice.customerMobile.replace(/\D/g, '')
                    : `91${invoice.customerMobile.replace(/\D/g, '')}`;

                const message = encodeURIComponent(
                    `Dear ${invoice.customerName},\n\n` +
                    `Thank you for your purchase! Please find your invoice details below:\n\n` +
                    `📄 Invoice No: ${invoice.invoiceNumber}\n` +
                    `💰 Amount: ₹${invoice.grandTotal.toLocaleString('en-IN')}\n` +
                    `📅 Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}\n` +
                    `💳 Payment: ${invoice.paymentMode.charAt(0).toUpperCase() + invoice.paymentMode.slice(1)}\n\n` +
                    `The invoice PDF has been downloaded. Please attach it to this chat.\n\n` +
                    `Thank you for choosing ${dealer?.showroomName || 'us'}! 🙏`
                );

                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSendingWA(false);
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
                        <p className="text-sm text-gray-500 mt-0.5">{invoice.invoiceNumber} — ₹{invoice.grandTotal.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        {/* Download PDF */}
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleDownload} disabled={downloading || !dealer}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-60 transition-all">
                            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {downloadDone ? 'Downloaded!' : 'Download PDF'}
                        </motion.button>

                        {/* WhatsApp */}
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleWhatsApp} disabled={sendingWA || !dealer}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] text-white text-sm font-semibold rounded-xl shadow-lg shadow-[#25D366]/20 disabled:opacity-60 transition-all">
                            {sendingWA ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                            Send to WhatsApp
                        </motion.button>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Invoice Preview */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                    {!dealer ? (
                        <div className="flex items-center justify-center py-32">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : (
                        <InvoiceTemplate ref={templateRef} invoice={invoice} dealer={dealer} />
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
