import { motion } from 'framer-motion';
import { ArrowRight, FileText, Sparkles, Play, ChevronDown, Zap, Shield, Clock } from 'lucide-react';

export default function Hero() {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 grid-pattern" />

            {/* Gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px] animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px]" />

            {/* Floating elements */}
            <motion.div
                animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-32 right-[15%] hidden lg:block"
            >
                <div className="glass-card rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-emerald-400 text-lg">$</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Invoice Paid</p>
                            <p className="text-sm font-semibold text-emerald-400">+$2,450.00</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [15, -15, 15], rotate: [0, -3, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-40 left-[10%] hidden lg:block"
            >
                <div className="glass-card rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">New Invoice</p>
                            <p className="text-sm font-semibold text-white">#INV-2847</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [-10, 10, -10], x: [5, -5, 5] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute top-48 left-[8%] hidden lg:block"
            >
                <div className="glass-card rounded-full px-4 py-2 shadow-xl">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-gray-400">AI-Powered</span>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-8"
                    >
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-indigo-300 font-medium">Now with AI-powered invoice generation</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold leading-[1.1] tracking-tight mb-8"
                    >
                        <span className="text-white">Create </span>
                        <span className="gradient-text">Professional</span>
                        <br />
                        <span className="text-white">Invoices in </span>
                        <span className="gradient-text-gold">Seconds</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
                    >
                        Streamline your billing workflow with smart automation, beautiful templates,
                        and real-time payment tracking. Trusted by{' '}
                        <span className="text-indigo-400 font-medium">50,000+</span> businesses worldwide.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.45 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                    >
                        <motion.a
                            href="/register"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl text-lg shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center gap-2"
                        >
                            Start Creating Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.a>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group px-8 py-4 glass-card rounded-2xl text-gray-300 font-semibold text-lg hover:text-white hover:border-indigo-500/30 transition-all duration-300 flex items-center gap-2"
                        >
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                                <Play className="w-4 h-4 text-white ml-0.5" />
                            </div>
                            Watch Demo
                        </motion.button>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                        className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
                    >
                        {[
                            { icon: <Zap className="w-4 h-4" />, value: '50K+', label: 'Active Users', color: 'text-indigo-400' },
                            { icon: <FileText className="w-4 h-4" />, value: '2M+', label: 'Invoices Created', color: 'text-purple-400' },
                            { icon: <Shield className="w-4 h-4" />, value: '99.9%', label: 'Uptime SLA', color: 'text-emerald-400' },
                            { icon: <Clock className="w-4 h-4" />, value: '<30s', label: 'Avg Creation', color: 'text-amber-400' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <span className={stat.color}>{stat.icon}</span>
                                    <span className={`text-2xl sm:text-3xl font-display font-bold ${stat.color}`}>{stat.value}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.8 }}
                    className="mt-20 relative max-w-5xl mx-auto"
                >
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl" />
                    <div className="relative glass-card rounded-2xl p-1 glow-indigo">
                        <div className="bg-[#0c0c18] rounded-xl overflow-hidden">
                            {/* Mock browser bar */}
                            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="bg-white/5 rounded-lg px-4 py-1.5 text-xs text-gray-500 flex items-center gap-2 max-w-md mx-auto">
                                        <Shield className="w-3 h-3 text-emerald-500" />
                                        app.invoiceflow.io/dashboard
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard mockup */}
                            <div className="p-6">
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    {[
                                        { label: 'Total Revenue', value: '$48,250', change: '+12.5%', color: 'from-indigo-600 to-indigo-500' },
                                        { label: 'Invoices Sent', value: '1,284', change: '+8.2%', color: 'from-purple-600 to-purple-500' },
                                        { label: 'Paid', value: '$41,090', change: '+15.3%', color: 'from-emerald-600 to-emerald-500' },
                                        { label: 'Outstanding', value: '$7,160', change: '-3.1%', color: 'from-amber-600 to-amber-500' },
                                    ].map((card) => (
                                        <div key={card.label} className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                                            <p className="text-xs text-gray-500 mb-2">{card.label}</p>
                                            <p className="text-lg font-bold text-white">{card.value}</p>
                                            <span className={`text-xs ${card.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {card.change}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Table mockup */}
                                <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
                                    <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-white/5 text-xs text-gray-500 font-medium">
                                        <span>Invoice</span>
                                        <span>Client</span>
                                        <span>Amount</span>
                                        <span>Status</span>
                                        <span>Date</span>
                                    </div>
                                    {[
                                        { id: '#INV-2847', client: 'Acme Corp', amount: '$3,200', status: 'Paid', color: 'bg-emerald-500/10 text-emerald-400', date: 'Feb 26' },
                                        { id: '#INV-2846', client: 'Tech Labs', amount: '$1,800', status: 'Pending', color: 'bg-amber-500/10 text-amber-400', date: 'Feb 25' },
                                        { id: '#INV-2845', client: 'Design Co', amount: '$4,500', status: 'Paid', color: 'bg-emerald-500/10 text-emerald-400', date: 'Feb 24' },
                                    ].map((row) => (
                                        <div key={row.id} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-white/5 last:border-0 text-sm">
                                            <span className="text-indigo-400 font-medium">{row.id}</span>
                                            <span className="text-gray-300">{row.client}</span>
                                            <span className="text-white font-medium">{row.amount}</span>
                                            <span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.color}`}>
                                                    {row.status}
                                                </span>
                                            </span>
                                            <span className="text-gray-500">{row.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.a
                    href="#features"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                    <span className="text-xs font-medium">Scroll to explore</span>
                    <ChevronDown className="w-5 h-5" />
                </motion.a>
            </motion.div>
        </section>
    );
}
