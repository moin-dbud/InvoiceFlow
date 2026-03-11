import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, MapPin, Phone, Shield,
    Save, Loader2, AlertCircle, CheckCircle2, Camera, Upload, X
} from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        showroomName: '',
        gstin: '',
        address: '',
        contactNumber: '',
    });

    const [dealerLogoUrl, setDealerLogoUrl] = useState('');
    const [signatureUrl, setSignatureUrl] = useState('');

    const [newLogo, setNewLogo] = useState(null);
    const [newLogoPreview, setNewLogoPreview] = useState('');

    // Signature upload state
    const [newSignature, setNewSignature] = useState(null);
    const [newSignaturePreview, setNewSignaturePreview] = useState('');

    const logoRef = useRef(null);
    const sigRef = useRef(null);

    // Fetch current user data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get(`${API}/auth/me`, authHeader());
                if (data.success) {
                    setForm({
                        showroomName: data.user.showroomName || '',
                        gstin: data.user.gstin || '',
                        address: data.user.address || '',
                        contactNumber: data.user.contactNumber || '',
                    });
                    setDealerLogoUrl(data.user.dealerLogo || '');
                    setSignatureUrl(data.user.digitalSignature || '');
                }
            } catch {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
        setSuccess('');
    };

    const handleLogoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setNewLogo(file);
        setNewLogoPreview(URL.createObjectURL(file));
    };

    const _removeLogo = () => {
        setNewLogo(null);
        setNewLogoPreview('');
        if (logoRef.current) logoRef.current.value = '';
    };

    const handleSignatureSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setNewSignature(file);
        setNewSignaturePreview(URL.createObjectURL(file));
    };

    const removeSignature = () => {
        setNewSignature(null);
        setNewSignaturePreview('');
        if (sigRef.current) sigRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const fd = new FormData();
            fd.append('showroomName', form.showroomName);
            fd.append('address', form.address);
            fd.append('contactNumber', form.contactNumber);
            if (newLogo) fd.append('dealerLogo', newLogo);
            if (newSignature) fd.append('digitalSignature', newSignature);

            const { data } = await axios.put(`${API}/auth/profile`, fd, {
                headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' },
            });

            if (data.success) {
                setSuccess('Profile updated successfully!');

                const updatedUser = {
                    id: data.user.id,
                    showroomName: data.user.showroomName,
                    gstin: data.user.gstin,
                    contactNumber: data.user.contactNumber,
                    dealerLogo: data.user.dealerLogo,
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('userUpdated'));

                if (data.user.dealerLogo) setDealerLogoUrl(data.user.dealerLogo);
                if (data.user.digitalSignature) setSignatureUrl(data.user.digitalSignature);
                setNewLogo(null);
                setNewLogoPreview('');
                setNewSignature(null);
                setNewSignaturePreview('');

                setTimeout(() => setSuccess(''), 4000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const displayLogo = newLogoPreview || dealerLogoUrl;

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-3xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-display font-extrabold text-white">Profile Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your dealership information</p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        {/* Profile Avatar Section */}
                        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                {/* Logo */}
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/[0.03] flex items-center justify-center">
                                        {displayLogo ? (
                                            <img src={displayLogo} alt="Dealer Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                                {form.showroomName?.charAt(0)?.toUpperCase() || 'D'}
                                            </div>
                                        )}
                                    </div>
                                    <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                                    <button type="button" onClick={() => logoRef.current?.click()}
                                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="text-center sm:text-left">
                                    <h2 className="text-xl font-display font-bold text-white">{form.showroomName}</h2>
                                    <p className="text-sm text-gray-500 mt-1 font-mono tracking-wider">{form.gstin}</p>
                                    <p className="text-xs text-gray-600 mt-2">Click the camera icon to update your dealer logo</p>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8">
                            <h3 className="text-lg font-display font-bold text-white mb-6">Dealership Information</h3>

                            <div className="space-y-5">
                                {/* Showroom Name */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-2">Showroom Name</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input type="text" name="showroomName" value={form.showroomName} onChange={handleChange} required
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300" />
                                    </div>
                                </div>

                                {/* GSTIN — Read-only */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-2">GSTIN <span className="text-gray-600">(cannot be changed)</span></label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                                        <input type="text" value={form.gstin} disabled
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-gray-500 text-sm font-mono tracking-wider cursor-not-allowed" />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-2">Address</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <textarea name="address" value={form.address} onChange={handleChange} rows={3} required
                                            className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300 resize-none" />
                                    </div>
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-2">Contact Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange} required maxLength={10}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300" />
                                    </div>
                                </div>

                                {/* Digital Signature — Image Upload */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                            <Upload className="w-3 h-3" /> Digital Signature
                                        </label>
                                        {(newSignaturePreview || signatureUrl) && (
                                            <button type="button" onClick={removeSignature}
                                                className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                                                <X className="w-3 h-3" /> Remove new
                                            </button>
                                        )}
                                    </div>

                                    {/* Preview area */}
                                    {newSignaturePreview ? (
                                        <div className="rounded-xl overflow-hidden border border-emerald-500/30 bg-white/[0.06] h-32 relative">
                                            <img src={newSignaturePreview} alt="New Signature" className="w-full h-full object-contain p-3" />
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600/80 rounded-md">
                                                <span className="text-[10px] text-white font-medium">NEW — will be saved</span>
                                            </div>
                                        </div>
                                    ) : signatureUrl ? (
                                        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] h-32">
                                            <img src={signatureUrl} alt="Digital Signature" className="w-full h-full object-contain p-3" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-600">
                                            <Upload className="w-6 h-6" />
                                            <span className="text-xs">No signature yet — upload one below</span>
                                        </div>
                                    )}

                                    {/* Upload button */}
                                    <input ref={sigRef} type="file" accept="image/*" onChange={handleSignatureSelect} className="hidden" />
                                    <button type="button" onClick={() => sigRef.current?.click()}
                                        className="mt-2 w-full py-2 border border-dashed border-white/10 rounded-xl text-xs text-gray-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2">
                                        <Upload className="w-3.5 h-3.5" />
                                        {signatureUrl ? 'Upload a new signature image' : 'Upload signature image (PNG/JPG)'}
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-6">
                                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        <p className="text-sm text-red-400">{error}</p>
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-6">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <p className="text-sm text-emerald-400">{success}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="flex justify-end mt-8">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-60">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
}
