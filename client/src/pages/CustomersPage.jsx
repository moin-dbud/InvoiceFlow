import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search, Users, Download, Loader2, Phone, IndianRupee, FileStack,
    ChevronRight, Trash2, AlertCircle, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export default function CustomersPage() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [deleteName, setDeleteName] = useState('');
    const [toast, setToast] = useState(null);

    const fetchCustomers = useCallback(async () => {
        try {
            const params = {};
            if (search) params.search = search;
            const { data } = await axios.get(`${API}/customers`, { ...authHeader(), params });
            setCustomers(data.customers || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [search]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${API}/customers/${id}`, authHeader());
            showToast(data.message || 'Customer deleted');
            setDeleteId(null);
            fetchCustomers();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete', 'error');
            setDeleteId(null);
        }
    };

    const handleExport = async () => {
        try {
            const { data } = await axios.get(`${API}/customers/export/csv`, {
                ...authHeader(),
                responseType: 'blob',
            });
            const url = URL.createObjectURL(new Blob([data]));
            const a = document.createElement('a');
            a.href = url; a.download = 'customers.csv';
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
        } catch { }
    };

    const openDeleteConfirm = (e, id, name) => {
        e.stopPropagation();
        setDeleteId(id);
        setDeleteName(name);
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-extrabold text-white">Customers</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your customer database</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExport}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-gray-300 font-semibold text-sm rounded-xl hover:bg-white/10 transition-all">
                        <Download className="w-4 h-4" /> Export CSV
                    </motion.button>
                </div>

                {/* Search */}
                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input type="text" placeholder="Search by name or mobile..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
                ) : customers.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 glass-card rounded-2xl">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-3">No customers yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Customers are automatically created when you generate invoices.</p>
                    </motion.div>
                ) : (
                    <div className="glass-card rounded-2xl overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {['Customer', 'Mobile', 'Address', 'Total Spend', 'Invoices', 'Actions'].map(h => (
                                            <th key={h} className="text-left text-xs font-medium text-gray-500 py-4 px-5 first:pl-6">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map(c => (
                                        <tr key={c._id} onClick={() => navigate(`/customers/${c._id}`)}
                                            className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors cursor-pointer group">
                                            <td className="py-4 px-5 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center text-indigo-400 text-sm font-bold flex-shrink-0">
                                                        {c.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-white">{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="text-sm text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {c.mobile}</span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="text-sm text-gray-500 truncate max-w-[200px] block">{c.address || '—'}</span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="text-sm font-semibold text-white flex items-center gap-1"><IndianRupee className="w-3 h-3 text-emerald-400" />{c.totalSpend.toLocaleString('en-IN')}</span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="text-sm text-gray-400 flex items-center gap-1"><FileStack className="w-3 h-3" /> {c.invoiceCount}</span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/customers/${c._id}`) }}
                                                        className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-white/5 transition-all" title="View">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={(e) => openDeleteConfirm(e, c._id, c.name)}
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

                        {/* Mobile Cards */}
                        <div className="sm:hidden divide-y divide-white/5">
                            {customers.map(c => (
                                <div key={c._id} className="p-4 hover:bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-2" onClick={() => navigate(`/customers/${c._id}`)}>
                                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center text-indigo-400 text-sm font-bold">
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0 cursor-pointer">
                                            <p className="text-sm font-medium text-white truncate">{c.name}</p>
                                            <p className="text-xs text-gray-500">{c.mobile}</p>
                                        </div>
                                        <button onClick={(e) => openDeleteConfirm(e, c._id, c.name)}
                                            className="p-2 rounded-lg text-gray-600 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex gap-4 ml-12">
                                        <span className="text-xs text-gray-400">₹{c.totalSpend.toLocaleString('en-IN')}</span>
                                        <span className="text-xs text-gray-400">{c.invoiceCount} invoices</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Delete Confirm Modal */}
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
                                <h3 className="text-xl font-display font-bold text-white mb-2">Delete Customer?</h3>
                                <p className="text-sm text-gray-400 mb-1">
                                    Permanently delete <span className="text-white font-medium">{deleteName}</span>?
                                </p>
                                <p className="text-xs text-gray-600 mb-6">If this customer has invoices, deletion will be blocked.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteId(null)}
                                        className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300">Cancel</button>
                                    <button onClick={() => handleDelete(deleteId)}
                                        className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl">Delete</button>
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
                            <div className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'
                                }`}>
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
