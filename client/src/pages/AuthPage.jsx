import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Zap,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Github,
    Chrome,
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin
                ? { email: form.email, password: form.password }
                : { name: form.name, email: form.email, password: form.password };

            const { data } = await axios.post(`${API}${endpoint}`, payload);

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setSuccess(isLogin ? 'Welcome back!' : 'Account created successfully!');
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen flex bg-[#06060b] font-sans">
            {/* ===== LEFT PANEL — Branding ===== */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
                {/* Warm gradient glow — matches reference */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-700/20 via-purple-600/15 to-amber-600/10 blur-[120px]" />
                <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-amber-600/8 blur-[100px]" />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 grid-pattern opacity-20" />

                {/* Content */}
                <div className="relative z-10 text-center px-16 max-w-lg">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mb-8"
                    >
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
                            Unlock your potential. Sign in to continue
                            <br />
                            your journey with us.
                        </p>
                    </motion.div>

                    {/* Floating stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex items-center justify-center gap-8 mt-12"
                    >
                        {[
                            { value: '50K+', label: 'Users' },
                            { value: '2M+', label: 'Invoices' },
                            { value: '99.9%', label: 'Uptime' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl font-display font-bold text-white/80">{stat.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Bottom copyright */}
                <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-xs text-gray-600">© 2026 InvoiceFlow Inc. All Rights Reserved.</p>
                </div>
            </div>

            {/* ===== RIGHT PANEL — Auth Form ===== */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
                {/* Subtle background glow */}
                <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px]" />

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-display font-bold text-white">
                                Invoice<span className="text-indigo-400">Flow</span>
                            </span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-3xl font-display font-extrabold text-white mb-2">
                                    {isLogin ? 'Welcome back' : 'Create account'}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {isLogin
                                        ? 'Please sign in to continue to your account.'
                                        : 'Enter your details to get started for free.'}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="space-y-3 mb-8">
                        <button className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white font-medium text-sm hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300">
                            <Chrome className="w-5 h-5 text-white/70" />
                            Continue with Google
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white font-medium text-sm hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300">
                            <Github className="w-5 h-5 text-white/70" />
                            Continue with GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">or continue with email</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name field — register only */}
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <label className="block text-xs font-medium text-gray-400 mb-2">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required={!isLogin}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-12 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot password — login only */}
                        {isLogin && (
                            <div className="text-right">
                                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <p className="text-sm text-red-400">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success Message */}
                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <p className="text-sm text-emerald-400">{success}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Terms */}
                    <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
                        By continuing, you agree to our{' '}
                        <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>.
                    </p>

                    {/* Switch mode */}
                    <div className="text-center mt-6">
                        <button
                            onClick={switchMode}
                            className="text-sm text-gray-500 hover:text-white transition-colors"
                        >
                            {isLogin ? (
                                <>Don&apos;t have an account? <span className="text-indigo-400 font-medium">Sign Up</span></>
                            ) : (
                                <>Already have an account? <span className="text-indigo-400 font-medium">Sign In</span></>
                            )}
                        </button>
                    </div>

                    {/* Back to home */}
                    <div className="text-center mt-6">
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to home
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
