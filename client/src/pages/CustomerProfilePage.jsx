import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, User, Phone, MapPin, IndianRupee,
    FileStack, Edit3, Check, X, Eye, AlertCircle, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const statusStyles = {
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    generated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function CustomerProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await axios.get(`${API}/customers/${id}`, authHeader());
                setCustomer(data.customer);
                setInvoices(data.invoices || []);
                setEditForm({ name: data.customer.name, mobile: data.customer.mobile, address: data.customer.address || '' });
            } catch { navigate('/customers'); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id, navigate]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${API}/customers/${id}`, editForm, authHeader());
            setCustomer(data.customer);
            setEditing(false);
            showToast('Customer updated');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update', 'error');
        } finally { setSaving(false); }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center py-32"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
            </DashboardLayout>
        );
    }

    if (!customer) return null;

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-5xl mx-auto">
                {/* Back button */}
                <button onClick={() => navigate('/customers')}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Customers
                </button>

                {/* Customer Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                {editing ? (
                                    <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="text-2xl font-display font-bold bg-transparent text-white border-b border-indigo-500/50 focus:outline-none pb-1" />
                                ) : (
                                    <h1 className="text-2xl font-display font-bold text-white">{customer.name}</h1>
                                )}
                                <p className="text-sm text-gray-500 mt-1">Customer since {new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                        {editing ? (
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(false)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                <button onClick={handleSave} disabled={saving}
                                    className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setEditing(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">
                                <Edit3 className="w-4 h-4" /> Edit
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                            <Phone className="w-4 h-4 text-indigo-400" />
                            {editing ? (
                                <input value={editForm.mobile} onChange={e => setEditForm({ ...editForm, mobile: e.target.value })}
                                    className="bg-transparent text-white text-sm focus:outline-none border-b border-indigo-500/30 flex-1" />
                            ) : (
                                <span className="text-sm text-white">{customer.mobile}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            {editing ? (
                                <input value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                    className="bg-transparent text-white text-sm focus:outline-none border-b border-indigo-500/30 flex-1" />
                            ) : (
                                <span className="text-sm text-white">{customer.address || '—'}</span>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">Total Spend</p>
                            <p className="text-xl font-display font-bold text-emerald-400 flex items-center gap-1">
                                <IndianRupee className="w-4 h-4" />{customer.totalSpend.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">Total Invoices</p>
                            <p className="text-xl font-display font-bold text-indigo-400 flex items-center gap-1">
                                <FileStack className="w-4 h-4" />{customer.invoiceCount}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Invoice History */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card rounded-2xl overflow-hidden">
                    <div className="p-6 pb-0">
                        <h2 className="text-lg font-display font-bold text-white">Invoice History</h2>
                        <p className="text-xs text-gray-500 mt-0.5 mb-4">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found</p>
                    </div>

                    {invoices.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <FileStack className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No invoices for this customer yet</p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            {['Invoice No.', 'Date', 'Amount', 'GST', 'Status', 'Payment'].map(h => (
                                                <th key={h} className="text-left text-xs font-medium text-gray-500 py-3 px-5 first:pl-6">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map(inv => (
                                            <tr key={inv._id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                                                <td className="py-3.5 px-5 pl-6"><span className="text-sm font-medium text-indigo-400">{inv.invoiceNumber}</span></td>
                                                <td className="py-3.5 px-5"><span className="text-sm text-gray-400">{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></td>
                                                <td className="py-3.5 px-5"><span className="text-sm font-semibold text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</span></td>
                                                <td className="py-3.5 px-5"><span className="text-sm text-gray-400">{inv.gstEnabled ? `${inv.gstRate}%` : '—'}</span></td>
                                                <td className="py-3.5 px-5">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusStyles[inv.status]}`}>{inv.status}</span>
                                                </td>
                                                <td className="py-3.5 px-5"><span className="text-sm text-gray-400 capitalize">{inv.paymentMode}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="sm:hidden divide-y divide-white/5">
                                {invoices.map(inv => (
                                    <div key={inv._id} className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-medium text-indigo-400">{inv.invoiceNumber}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles[inv.status]}`}>{inv.status}</span>
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span className="text-sm font-bold text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</span>
                                            <span className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-6 right-6 z-[70]">
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
