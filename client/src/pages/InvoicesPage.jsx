import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, FileStack, Eye, Download, XCircle, Loader2,
    AlertCircle, CheckCircle2, Calendar, MessageCircle, Trash2
} from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import GenerateInvoiceModal from '../components/GenerateInvoiceModal';
import InvoicePreviewModal from '../components/InvoicePreviewModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const statusStyles = {
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    generated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const tabs = ['all', 'draft', 'generated', 'cancelled'];

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState(null);
    const [cancelId, setCancelId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [toast, setToast] = useState(null);

    const fetchInvoices = useCallback(async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const { data } = await axios.get(`${API}/invoices`, { ...authHeader(), params });
            setInvoices(data.invoices);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [search, statusFilter, startDate, endDate]);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCancel = async (id) => {
        try {
            await axios.put(`${API}/invoices/${id}/cancel`, {}, authHeader());
            showToast('Invoice cancelled');
            setCancelId(null);
            fetchInvoices();
        } catch { showToast('Failed to cancel', 'error'); }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API}/invoices/${id}`, authHeader());
            showToast('Invoice deleted permanently');
            setDeleteId(null);
            fetchInvoices();
        } catch { showToast('Failed to delete', 'error'); }
    };

    const handleGenerate = async (id) => {
        try {
            const { data } = await axios.put(`${API}/invoices/${id}/generate`, {}, authHeader());
            showToast('Invoice generated');
            setPreviewInvoice(data.invoice);
            fetchInvoices();
        } catch { showToast('Failed to generate', 'error'); }
    };

    // Called when a new invoice is created from modal — show the preview with download/WA buttons
    const handleInvoiceCreated = async (createdInvoice) => {
        setModalOpen(false);
        fetchInvoices();
        // Fetch the full invoice from backend (with populated data)
        try {
            const { data } = await axios.get(`${API}/invoices/${createdInvoice._id}`, authHeader());
            setPreviewInvoice(data.invoice);
        } catch {
            showToast('Invoice created!');
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-extrabold text-white">Invoices</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage and generate invoices</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20">
                        <Plus className="w-5 h-5" /> Generate Invoice
                    </motion.button>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setStatusFilter(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${statusFilter === tab
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'text-gray-500 hover:text-white bg-white/[0.02] border border-white/5 hover:border-white/10'
                                }`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search & Date Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input type="text" placeholder="Search by invoice # or customer..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                className="pl-10 pr-3 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 min-w-[150px] [color-scheme:dark]" />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                className="pl-10 pr-3 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 min-w-[150px] [color-scheme:dark]" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    </div>
                ) : invoices.length === 0 && !search && statusFilter === 'all' ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 glass-card rounded-2xl">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileStack className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-3">No invoices yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">
                            Start by generating your first invoice for a customer.
                        </p>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20">
                            <Plus className="w-5 h-5" /> Generate Your First Invoice
                        </motion.button>
                    </motion.div>
                ) : invoices.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No invoices found</p>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {['Invoice No.', 'Customer', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                                            <th key={h} className="text-left text-xs font-medium text-gray-500 py-4 px-5 first:pl-6">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv._id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                                            <td className="py-4 px-5 pl-6">
                                                <span className="text-sm font-medium text-indigo-400">{inv.invoiceNumber}</span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <p className="text-sm text-white">{inv.customerName}</p>
                                                <p className="text-xs text-gray-600">{inv.customerMobile}</p>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="text-sm text-gray-400">{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="text-sm font-semibold text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusStyles[inv.status]}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => setPreviewInvoice(inv)}
                                                        className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-white/5 transition-all" title="View & Download">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {inv.status === 'draft' && (
                                                        <button onClick={() => handleGenerate(inv._id)}
                                                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                                                            Generate
                                                        </button>
                                                    )}
                                                    {inv.status !== 'cancelled' && (
                                                        <button onClick={() => setCancelId(inv._id)}
                                                            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all" title="Cancel">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => setDeleteId(inv._id)}
                                                        className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden divide-y divide-white/5">
                            {invoices.map(inv => (
                                <div key={inv._id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium text-indigo-400">{inv.invoiceNumber}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles[inv.status]}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white">{inv.customerName}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm font-bold text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</span>
                                        <span className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</span>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => setPreviewInvoice(inv)} className="flex-1 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400 font-medium">View & Download</button>
                                        {inv.status !== 'cancelled' && (
                                            <button onClick={() => setCancelId(inv._id)} className="flex-1 py-2 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-400">Cancel</button>
                                        )}
                                        <button onClick={() => setDeleteId(inv._id)} className="py-2 px-3 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-400">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generate Invoice Modal */}
                <AnimatePresence>
                    {modalOpen && (
                        <GenerateInvoiceModal
                            onClose={() => setModalOpen(false)}
                            onSuccess={handleInvoiceCreated}
                        />
                    )}
                </AnimatePresence>

                {/* Invoice Preview with Download + WhatsApp */}
                <AnimatePresence>
                    {previewInvoice && (
                        <InvoicePreviewModal
                            invoice={previewInvoice}
                            onClose={() => setPreviewInvoice(null)}
                        />
                    )}
                </AnimatePresence>

                {/* Cancel Confirm */}
                <AnimatePresence>
                    {cancelId && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                            onClick={() => setCancelId(null)}>
                            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                onClick={e => e.stopPropagation()}
                                className="glass-card rounded-2xl p-8 max-w-sm w-full text-center">
                                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-7 h-7 text-red-400" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-white mb-2">Cancel Invoice?</h3>
                                <p className="text-sm text-gray-400 mb-6">This will reverse customer totals and restore product stock.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setCancelId(null)} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300">Keep</button>
                                    <button onClick={() => handleCancel(cancelId)} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl">Cancel Invoice</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Confirm */}
                <AnimatePresence>
                    {deleteId && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                            onClick={() => setDeleteId(null)}>
                            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                onClick={e => e.stopPropagation()}
                                className="glass-card rounded-2xl p-8 max-w-sm w-full text-center">
                                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-7 h-7 text-red-400" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-white mb-2">Delete Invoice?</h3>
                                <p className="text-sm text-gray-400 mb-6">This will permanently delete the invoice from the database. This action cannot be undone.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300">Cancel</button>
                                    <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl">Delete Forever</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-6 right-6 z-[80]">
                            <div className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                                {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                {toast.msg}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
