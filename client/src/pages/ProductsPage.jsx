import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Package, Edit3, Trash2, X, Upload, Image as ImageIcon,
    Loader2, AlertCircle, CheckCircle2, Battery, Gauge, Boxes,
    IndianRupee, ToggleLeft, ToggleRight, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [toast, setToast] = useState(null);

    const fetchProducts = useCallback(async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterStatus !== 'all') params.status = filterStatus;
            const { data } = await axios.get(`${API}/products`, { ...authHeader(), params });
            setProducts(data.products);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API}/products/${id}`, authHeader());
            showToast('Product deactivated');
            setDeleteConfirm(null);
            fetchProducts();
        } catch { showToast('Failed to deactivate', 'error'); }
    };

    const openEdit = (product) => { setEditProduct(product); setModalOpen(true); };
    const openAdd = () => { setEditProduct(null); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditProduct(null); };

    const activeCount = products.filter(p => p.status === 'active').length;
    const inactiveCount = products.filter(p => p.status === 'inactive').length;

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-extrabold text-white">Products</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your E-Vehicle catalogue</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAdd}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all">
                        <Plus className="w-5 h-5" /> Add Product
                    </motion.button>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total Products', value: products.length, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: <Package className="w-5 h-5" /> },
                        { label: 'Active', value: activeCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <ToggleRight className="w-5 h-5" /> },
                        { label: 'Inactive', value: inactiveCount, color: 'text-gray-400', bg: 'bg-gray-500/10', icon: <ToggleLeft className="w-5 h-5" /> },
                    ].map(s => (
                        <div key={s.label} className="glass-card rounded-xl p-5 flex items-center gap-4">
                            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
                            <div>
                                <p className="text-xs text-gray-500">{s.label}</p>
                                <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input type="text" placeholder="Search products by name..." value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                    </div>
                    <div className="relative">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 cursor-pointer min-w-[140px]">
                            <option value="all" className="bg-[#0c0c18]">All Status</option>
                            <option value="active" className="bg-[#0c0c18]">Active</option>
                            <option value="inactive" className="bg-[#0c0c18]">Inactive</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    </div>
                ) : products.length === 0 && !search ? (
                    /* Empty state */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 glass-card rounded-2xl">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-3">No products yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">
                            Start by adding your first E-Vehicle or accessory to your product catalogue.
                        </p>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAdd}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20">
                            <Plus className="w-5 h-5" /> Add Your First Product
                        </motion.button>
                    </motion.div>
                ) : products.length === 0 && search ? (
                    <div className="text-center py-20">
                        <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No products found for "{search}"</p>
                    </div>
                ) : (
                    /* Product Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        <AnimatePresence>
                            {products.map((product, i) => (
                                <motion.div key={product._id}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`glass-card glass-card-hover rounded-2xl overflow-hidden group transition-all duration-300 ${product.status === 'inactive' ? 'opacity-60' : ''}`}>
                                    {/* Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-white/[0.02] to-white/[0.05] overflow-hidden">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-16 h-16 text-gray-700" />
                                            </div>
                                        )}
                                        {/* Status badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.status === 'active'
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/20'
                                                }`}>
                                                {product.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {/* Image count badge */}
                                        {product.images?.length > 1 && (
                                            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-gray-300">
                                                <ImageIcon className="w-3 h-3" /> {product.images.length}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="text-base font-display font-bold text-white mb-1 truncate">{product.name}</h3>

                                        <div className="flex items-center gap-1 mb-3">
                                            <IndianRupee className="w-4 h-4 text-indigo-400" />
                                            <span className="text-lg font-display font-bold text-indigo-400">
                                                {Number(product.basePrice).toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-xs text-gray-600 ml-1">ex-GST</span>
                                        </div>

                                        {/* Specs */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {product.batteryCapacity && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs">
                                                    <Battery className="w-3 h-3" /> {product.batteryCapacity} kWh
                                                </span>
                                            )}
                                            {product.range && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs">
                                                    <Gauge className="w-3 h-3" /> {product.range} km
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                <Boxes className="w-3 h-3" /> {product.stock} in stock
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(product)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all">
                                                <Edit3 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button onClick={() => setDeleteConfirm(product._id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                <Trash2 className="w-3.5 h-3.5" /> Deactivate
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {modalOpen && (
                        <ProductModal
                            product={editProduct}
                            onClose={closeModal}
                            onSuccess={() => { closeModal(); fetchProducts(); showToast(editProduct ? 'Product updated' : 'Product added'); }}
                        />
                    )}
                </AnimatePresence>

                {/* Delete Confirm */}
                <AnimatePresence>
                    {deleteConfirm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                            onClick={() => setDeleteConfirm(null)}>
                            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                onClick={e => e.stopPropagation()}
                                className="glass-card rounded-2xl p-8 max-w-sm w-full text-center">
                                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-7 h-7 text-red-400" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-white mb-2">Deactivate Product?</h3>
                                <p className="text-sm text-gray-400 mb-6">This product will be marked as inactive and won't appear in invoice dropdowns.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">Cancel</button>
                                    <button onClick={() => handleDelete(deleteConfirm)}
                                        className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-500 transition-all">Deactivate</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-6 right-6 z-[70]">
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


/* ======================== PRODUCT MODAL ======================== */
function ProductModal({ product, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef(null);

    const [form, setForm] = useState({
        name: product?.name || '',
        basePrice: product?.basePrice || '',
        description: product?.description || '',
        batteryCapacity: product?.batteryCapacity || '',
        range: product?.range || '',
        stock: product?.stock ?? '',
        status: product?.status || 'active',
    });

    const [existingImages, setExistingImages] = useState(product?.images || []);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);

    const totalImages = existingImages.length + newFiles.length;

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleFileAdd = (e) => {
        const files = Array.from(e.target.files);
        const remaining = 3 - totalImages;
        const toAdd = files.slice(0, remaining);
        setNewFiles(prev => [...prev, ...toAdd]);
        setNewPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
        fileRef.current.value = '';
    };

    const removeExisting = (idx) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

    const removeNew = (idx) => {
        setNewFiles(prev => prev.filter((_, i) => i !== idx));
        setNewPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('basePrice', form.basePrice);
            fd.append('description', form.description);
            fd.append('batteryCapacity', form.batteryCapacity);
            fd.append('range', form.range);
            fd.append('stock', form.stock);
            fd.append('status', form.status);
            fd.append('existingImages', JSON.stringify(existingImages));
            newFiles.forEach(f => fd.append('images', f));

            const config = { ...authHeader(), headers: { ...authHeader().headers, 'Content-Type': 'multipart/form-data' } };

            if (product) {
                await axios.put(`${API}/products/${product._id}`, fd, config);
            } else {
                await axios.post(`${API}/products`, fd, config);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10 px-4"
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                onClick={e => e.stopPropagation()}
                className="glass-card rounded-2xl p-8 w-full max-w-2xl relative my-auto">
                {/* Close */}
                <button onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                    <X className="w-4 h-4" />
                </button>

                <h2 className="text-2xl font-display font-bold text-white mb-1">
                    {product ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    {product ? 'Update product details below' : 'Fill in the product details to add to your catalogue'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Product / Vehicle Name *</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g., Bhoomi Bolt Pro"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                    </div>

                    {/* Price & Stock row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Base Price (ex-GST) * ₹</label>
                            <input type="number" name="basePrice" value={form.basePrice} onChange={handleChange} required min="0" placeholder="85000"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Stock / Inventory Count *</label>
                            <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" placeholder="25"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Product Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Specifications, features..."
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none" />
                    </div>

                    {/* EV Specs row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Battery Capacity (kWh)</label>
                            <input type="number" name="batteryCapacity" value={form.batteryCapacity} onChange={handleChange} min="0" step="0.1" placeholder="3.5"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Range (km)</label>
                            <input type="number" name="range" value={form.range} onChange={handleChange} min="0" placeholder="120"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Status</label>
                        <div className="flex gap-3">
                            {['active', 'inactive'].map(s => (
                                <button key={s} type="button" onClick={() => setForm(prev => ({ ...prev, status: s }))}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.status === s
                                            ? s === 'active'
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                                            : 'bg-white/[0.02] border-white/10 text-gray-600 hover:text-gray-400'
                                        }`}>
                                    {s === 'active' ? 'Active' : 'Inactive'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">
                            Product Images <span className="text-gray-600">({totalImages}/3)</span>
                        </label>
                        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileAdd} className="hidden" />

                        <div className="grid grid-cols-3 gap-3">
                            {/* Existing images */}
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative group h-28 rounded-xl overflow-hidden border border-white/10">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeExisting(i)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}

                            {/* New previews */}
                            {newPreviews.map((url, i) => (
                                <div key={`new-${i}`} className="relative group h-28 rounded-xl overflow-hidden border border-indigo-500/20">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-[10px] text-center py-0.5">New</div>
                                    <button type="button" onClick={() => removeNew(i)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}

                            {/* Add button */}
                            {totalImages < 3 && (
                                <button type="button" onClick={() => fileRef.current?.click()}
                                    className="h-28 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-white/[0.02] transition-all">
                                    <Upload className="w-5 h-5" />
                                    <span className="text-xs">Upload</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 font-medium hover:bg-white/10 transition-all">
                            Cancel
                        </button>
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : product ? 'Update Product' : 'Add Product'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
