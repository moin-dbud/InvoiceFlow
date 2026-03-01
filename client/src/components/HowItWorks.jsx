import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
    PenTool,
    Send,
    CreditCard,
    BarChart3,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: <PenTool className="w-7 h-7" />,
        title: 'Create Your Invoice',
        description: 'Use our AI-powered editor or choose from 50+ templates. Auto-fill client details, add line items, and the system calculates taxes automatically.',
        highlights: ['AI-powered auto-fill', 'Smart tax calculations', '50+ premium templates'],
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-500',
        glowColor: 'shadow-indigo-500/20',
    },
    {
        number: '02',
        icon: <Send className="w-7 h-7" />,
        title: 'Send & Track',
        description: 'Deliver invoices via email, SMS, or share a secure link. Track when clients open, view, and interact with your invoices in real-time.',
        highlights: ['Email & SMS delivery', 'Real-time open tracking', 'Secure shareable links'],
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-500',
        glowColor: 'shadow-purple-500/20',
    },
    {
        number: '03',
        icon: <CreditCard className="w-7 h-7" />,
        title: 'Get Paid Instantly',
        description: 'Clients pay directly through the invoice with credit cards, bank transfers, or digital wallets. Funds arrive in your account within hours.',
        highlights: ['One-click payments', 'Multiple payment methods', 'Same-day deposits'],
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-500',
        glowColor: 'shadow-emerald-500/20',
    },
    {
        number: '04',
        icon: <BarChart3 className="w-7 h-7" />,
        title: 'Analyze & Grow',
        description: 'Get detailed insights into your revenue, payment trends, and client behavior. Make data-driven decisions to grow your business faster.',
        highlights: ['Revenue dashboards', 'Payment analytics', 'Growth insights'],
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-500',
        glowColor: 'shadow-amber-500/20',
    },
];

function StepCard({ step, index }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`flex flex-col lg:flex-row items-center gap-10 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
        >
            {/* Text Content */}
            <div className="flex-1 space-y-5">
                <div className="flex items-center gap-4">
                    <span className={`text-5xl font-display font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-40`}>
                        {step.number}
                    </span>
                    <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white shadow-xl ${step.glowColor}`}>
                        {step.icon}
                    </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    {step.title}
                </h3>

                <p className="text-gray-400 leading-relaxed text-lg">
                    {step.description}
                </p>

                <ul className="space-y-2.5">
                    {step.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 bg-gradient-to-br ${step.color} rounded-full text-white p-0.5`} />
                            {highlight}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Visual Card */}
            <div className="flex-1 w-full max-w-lg">
                <div className="glass-card rounded-2xl p-6 sm:p-8 glow-indigo">
                    {index === 0 && <InvoicePreview />}
                    {index === 1 && <TrackingPreview />}
                    {index === 2 && <PaymentPreview />}
                    {index === 3 && <AnalyticsPreview />}
                </div>
            </div>
        </motion.div>
    );
}

function InvoicePreview() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-2.5 w-28 bg-white/10 rounded-full mb-2" />
                    <div className="h-2 w-20 bg-white/5 rounded-full" />
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Invoice</p>
                    <p className="text-sm font-bold text-indigo-400">#INV-2847</p>
                </div>
            </div>
            <div className="border-t border-white/5 pt-4 space-y-3">
                {['Website Redesign', 'Brand Identity', 'SEO Optimization'].map((item, i) => (
                    <div key={item} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${['from-indigo-500 to-indigo-400', 'from-purple-500 to-purple-400', 'from-emerald-500 to-emerald-400'][i]}`} />
                            <span className="text-sm text-gray-300">{item}</span>
                        </div>
                        <span className="text-sm font-medium text-white">${[2400, 1800, 1200][i]}</span>
                    </div>
                ))}
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-400">Total</span>
                <span className="text-xl font-display font-bold gradient-text">$5,400.00</span>
            </div>
        </div>
    );
}

function TrackingPreview() {
    return (
        <div className="space-y-4">
            <p className="text-sm font-semibold text-white mb-4">Invoice Activity</p>
            {[
                { status: 'Invoice Created', time: '2 min ago', color: 'bg-indigo-500', active: true },
                { status: 'Email Sent', time: '1 min ago', color: 'bg-purple-500', active: true },
                { status: 'Invoice Opened', time: '30 sec ago', color: 'bg-amber-500', active: true },
                { status: 'Payment Pending', time: 'Waiting...', color: 'bg-gray-600', active: false },
            ].map((item, i) => (
                <div key={item.status} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                        <div className={`w-3.5 h-3.5 rounded-full ${item.color} ${item.active ? 'ring-4 ring-opacity-20' : ''}`} style={{ boxShadow: item.active ? `0 0 15px ${['#6366f1', '#a855f7', '#f59e0b', '#666'][i]}40` : 'none' }} />
                        {i < 3 && <div className="w-px h-8 bg-white/10 mt-1" />}
                    </div>
                    <div className="-mt-0.5">
                        <p className={`text-sm font-medium ${item.active ? 'text-white' : 'text-gray-500'}`}>{item.status}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function PaymentPreview() {
    return (
        <div className="space-y-5">
            <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                </div>
                <p className="text-lg font-display font-bold text-white">Payment Received!</p>
                <p className="text-3xl font-display font-extrabold text-emerald-400 mt-1">$5,400.00</p>
                <p className="text-xs text-gray-500 mt-2">Via Credit Card • Feb 27, 2026</p>
            </div>
            <div className="flex gap-3">
                {['Visa', 'Bank', 'Apple Pay'].map((method) => (
                    <div key={method} className="flex-1 bg-white/[0.03] rounded-xl p-3 text-center border border-white/5 hover:border-emerald-500/20 transition-colors">
                        <p className="text-xs text-gray-400">{method}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnalyticsPreview() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-white">Monthly Revenue</p>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+24.5%</span>
            </div>
            <div className="flex items-end gap-1.5 h-32">
                {[40, 55, 35, 70, 50, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className={`flex-1 rounded-sm ${i === 11 ? 'bg-gradient-to-t from-indigo-600 to-purple-500' : 'bg-white/[0.06] hover:bg-white/[0.1]'} transition-colors`}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dec</span>
            </div>
        </div>
    );
}

export default function HowItWorks() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section id="how-it-works" className="relative py-32 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-600/5 rounded-full blur-[150px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div ref={sectionRef} className="text-center max-w-3xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 mb-6"
                    >
                        <ArrowRight className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-300 font-medium">Simple Process</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-6 leading-tight"
                    >
                        How It{' '}
                        <span className="gradient-text">Works</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-400 leading-relaxed"
                    >
                        Four simple steps from creating your invoice to getting paid.
                        No complexity, just results.
                    </motion.p>
                </div>

                {/* Steps */}
                <div className="space-y-24">
                    {steps.map((step, index) => (
                        <StepCard key={step.number} step={step} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
