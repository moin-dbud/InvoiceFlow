import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    FileText, Zap, Building2, MapPin, Phone, Shield, Upload,
    PenTool, Eye, EyeOff, ArrowRight, Loader2, AlertCircle,
    CheckCircle2, Image, Lock, X, Eraser, RotateCcw
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState('form'); // 'form' | 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [userId, setUserId] = useState('');
    const [devOtp, setDevOtp] = useState('');

    const [form, setForm] = useState({
        showroomName: '', gstin: '', address: '',
        contactNumber: '', password: '',
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [hasSigned, setHasSigned] = useState(false);
    const [gstinValid, setGstinValid] = useState(null);

    const logoRef = useRef(null);
    const sigPadRef = useRef(null);

    // OTP state
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const otpRefs = useRef([]);
    const timerRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError('');

        if (name === 'gstin') {
            const upper = value.toUpperCase();
            setForm(prev => ({ ...prev, gstin: upper }));
            if (upper.length === 15) setGstinValid(GSTIN_REGEX.test(upper));
            else if (upper.length > 0) setGstinValid(null);
            else setGstinValid(null);
        }
    };

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setLogoFile(file); setLogoPreview(url);
    }, []);

    const removeLogo = () => {
        setLogoFile(null); setLogoPreview(''); logoRef.current.value = '';
    };

    const clearSignature = () => {
        sigPadRef.current?.clear();
        setHasSigned(false);
    };

    const onSignEnd = () => {
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) setHasSigned(true);
    };

    // Convert signature canvas to File for FormData
    const getSignatureFile = () => {
        return new Promise((resolve) => {
            if (!sigPadRef.current || sigPadRef.current.isEmpty()) { resolve(null); return; }
            const dataURL = sigPadRef.current.toDataURL('image/png');
            // Convert data URL to blob
            fetch(dataURL)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'signature.png', { type: 'image/png' });
                    resolve(file);
                })
                .catch(() => resolve(null));
        });
    };

    const startTimer = () => {
        setTimer(60);
        setCanResend(false);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (form.gstin.length === 15 && !GSTIN_REGEX.test(form.gstin)) {
            setError('Invalid GSTIN format'); return;
        }
        if (!logoFile) {
            setError('Please upload your dealer logo'); return;
        }
        if (!hasSigned || !sigPadRef.current || sigPadRef.current.isEmpty()) {
            setError('Please draw your digital signature'); return;
        }
        setLoading(true); setError('');

        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            fd.append('dealerLogo', logoFile);
            const sigFile = await getSignatureFile();
            if (sigFile) fd.append('digitalSignature', sigFile);

            const { data } = await axios.post(`${API}/auth/register`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.success) {
                setUserId(data.userId);
                setDevOtp(data.otp || '');
                setStep('otp');
                startTimer();
                setSuccess('Registration successful! Enter the OTP to verify.');
            }
        } catch (err) {
            console.error('Registration error:', err.response?.status, err.response?.data, err.message);
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpValues];
        newOtp[index] = value.slice(-1);
        setOtpValues(newOtp);
        setError('');
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otpValues];
        pasted.split('').forEach((ch, i) => { newOtp[i] = ch; });
        setOtpValues(newOtp);
        const focusIdx = Math.min(pasted.length, 5);
        otpRefs.current[focusIdx]?.focus();
    };

    const handleVerifyOtp = async () => {
        const otp = otpValues.join('');
        if (otp.length !== 6) { setError('Please enter the full 6-digit OTP'); return; }
        setLoading(true); setError('');

        try {
            const { data } = await axios.post(`${API}/auth/verify-otp`, { userId, otp });
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setSuccess('Verified! Redirecting...');
                setTimeout(() => navigate('/dashboard'), 1200);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        try {
            const { data } = await axios.post(`${API}/auth/resend-otp`, { userId });
            if (data.success) {
                setDevOtp(data.otp || '');
                startTimer();
                setSuccess('OTP resent successfully');
                setOtpValues(['', '', '', '', '', '']);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen flex bg-[#06060b] font-sans">
            {/* LEFT BRANDING PANEL */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-700/20 via-purple-600/15 to-amber-600/10 blur-[120px]" />
                <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-amber-600/8 blur-[100px]" />
                <div className="absolute inset-0 grid-pattern opacity-20" />

                <div className="relative z-10 text-center px-16 max-w-lg">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="inline-flex items-center gap-3 mb-10">
                            <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                                <FileText className="w-7 h-7 text-white" />
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                                    <Zap className="w-2 h-2 text-amber-900" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-5xl font-display font-extrabold mb-6">
                            <span className="gradient-text">InvoiceFlow</span>
                        </h1>
                        <p className="text-lg text-gray-400 leading-relaxed">
                            Register your dealership and start<br />generating invoices in minutes.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-8 mt-12">
                        {[{ value: '50K+', label: 'Dealers' }, { value: '2M+', label: 'Invoices' }, { value: '99.9%', label: 'Uptime' }].map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-2xl font-display font-bold text-white/80">{s.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
                <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-xs text-gray-600">© 2026 InvoiceFlow Inc. All Rights Reserved.</p>
                </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-10 overflow-y-auto">
                <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px]" />

                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                    className="relative z-10 w-full max-w-lg">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-display font-bold text-white">Invoice<span className="text-indigo-400">Flow</span></span>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'form' ? (
                            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-display font-extrabold text-white mb-2">Register Dealership</h2>
                                    <p className="text-gray-500 text-sm">Fill in your dealership details to get started</p>
                                </div>

                                <form onSubmit={handleRegister} className="space-y-4">
                                    {/* Showroom Name */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-2">Showroom Name</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                            <input type="text" name="showroomName" value={form.showroomName} onChange={handleChange} placeholder="Bhoomi Motors" required
                                                className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300" />
                                        </div>
                                    </div>

                                    {/* GSTIN */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-2">
                                            GSTIN
                                            {gstinValid === true && <span className="ml-2 text-emerald-400">✓ Valid</span>}
                                            {gstinValid === false && <span className="ml-2 text-red-400">✗ Invalid format</span>}
                                        </label>
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                            <input type="text" name="gstin" value={form.gstin} onChange={handleChange} placeholder="27AADCB2230M1Z3" maxLength={15} required
                                                className={`w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-white/[0.05] focus:ring-1 transition-all duration-300 uppercase tracking-wider font-mono ${gstinValid === false ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' :
                                                    gstinValid === true ? 'border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/20' :
                                                        'border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20'
                                                    }`} />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-2">Address</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Full showroom address" required rows={2}
                                                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300 resize-none" />
                                        </div>
                                    </div>

                                    {/* Contact Number + Password row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-2">Contact Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                                <input type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="9876543210" required maxLength={10}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-2">Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••" required minLength={6}
                                                    className="w-full pl-12 pr-10 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logo + Signature row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Dealer Logo */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-2">Dealer Logo</label>
                                            <input ref={logoRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e)} className="hidden" />
                                            {logoPreview ? (
                                                <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] h-28">
                                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                                                    <button type="button" onClick={removeLogo}
                                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="w-3 h-3 text-white" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => logoRef.current?.click()}
                                                    className="w-full h-28 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-white/[0.02] transition-all">
                                                    <Image className="w-6 h-6" />
                                                    <span className="text-xs">Upload Logo</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Digital Signature Pad */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                                    <PenTool className="w-3 h-3" /> Draw Signature
                                                </label>
                                                {hasSigned && (
                                                    <button type="button" onClick={clearSignature}
                                                        className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                                                        <RotateCcw className="w-3 h-3" /> Clear
                                                    </button>
                                                )}
                                            </div>
                                            <div className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 h-28 ${hasSigned
                                                ? 'border-emerald-500/30 bg-white/[0.06]'
                                                : 'border-dashed border-white/10 bg-white/[0.03]'
                                                }`}>
                                                <SignatureCanvas
                                                    ref={sigPadRef}
                                                    penColor="#1a1a2e"
                                                    backgroundColor="rgba(255,255,255,0.95)"
                                                    canvasProps={{
                                                        className: 'w-full h-full',
                                                        style: { width: '100%', height: '100%' },
                                                    }}
                                                    onEnd={onSignEnd}
                                                />
                                                {!hasSigned && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                        <PenTool className="w-5 h-5 text-gray-600 mb-1" />
                                                        <span className="text-[10px] text-gray-600">Sign here</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error / Success */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                                <p className="text-sm text-red-400">{error}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Submit */}
                                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
                                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>Register & Verify <ArrowRight className="w-4 h-4" /></>)}
                                    </motion.button>
                                </form>

                                <p className="text-xs text-gray-600 text-center mt-5">
                                    By registering, you agree to our <a href="#" className="text-indigo-400">Terms</a> and <a href="#" className="text-indigo-400">Privacy Policy</a>.
                                </p>
                                <div className="text-center mt-4">
                                    <Link to="/login" className="text-sm text-gray-500 hover:text-white transition-colors">
                                        Already have an account? <span className="text-indigo-400 font-medium">Sign In</span>
                                    </Link>
                                </div>
                            </motion.div>

                        ) : (
                            /* OTP SCREEN */
                            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="text-center">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Phone className="w-9 h-9 text-indigo-400" />
                                </div>
                                <h2 className="text-3xl font-display font-extrabold text-white mb-2">Verify OTP</h2>
                                <p className="text-gray-500 text-sm mb-2">
                                    Enter the 6-digit code sent to <span className="text-white font-medium">{form.contactNumber}</span>
                                </p>
                                {devOtp && (
                                    <p className="text-xs text-amber-400/70 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-1.5 inline-block mb-6">
                                        Dev OTP: <span className="font-mono font-bold">{devOtp}</span>
                                    </p>
                                )}

                                {/* OTP Inputs */}
                                <div className="flex justify-center gap-3 my-8" onPaste={handleOtpPaste}>
                                    {otpValues.map((val, i) => (
                                        <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1}
                                            value={val} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className={`w-13 h-14 text-center text-xl font-bold bg-white/[0.03] border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-300 ${val ? 'border-indigo-500/50 focus:ring-indigo-500/30' : 'border-white/10 focus:ring-indigo-500/20'
                                                }`} />
                                    ))}
                                </div>

                                {/* Timer */}
                                <p className="text-sm text-gray-500 mb-6">
                                    {canResend ? (
                                        <button onClick={handleResendOtp} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                            Resend OTP
                                        </button>
                                    ) : (
                                        <>Resend OTP in <span className="text-white font-medium">{timer}s</span></>
                                    )}
                                </p>

                                {/* Error / Success */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                            <p className="text-sm text-red-400">{error}</p>
                                        </motion.div>
                                    )}
                                    {success && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <p className="text-sm text-emerald-400">{success}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleVerifyOtp} disabled={loading}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>Verify & Continue <ArrowRight className="w-4 h-4" /></>)}
                                </motion.button>

                                <button onClick={() => setStep('form')} className="mt-4 text-sm text-gray-500 hover:text-white transition-colors">
                                    ← Back to registration
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
