import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
    Zap,
    BarChart3,
    Globe,
    Shield,
    Palette,
    Bell,
    CreditCard,
    Clock,
    ArrowUpRight,
} from 'lucide-react';

const features = [
    {
        icon: <Zap className="w-6 h-6" />,
        title: 'AI Auto-Fill',
        description: 'Smart AI fills in client details, line items, and tax calculations instantly from past data.',
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-500/10',
        textColor: 'text-indigo-400',
    },
    {
        icon: <Palette className="w-6 h-6" />,
        title: 'Beautiful Templates',
        description: 'Choose from 50+ professionally designed invoice templates that match your brand identity.',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-400',
    },
    {
        icon: <CreditCard className="w-6 h-6" />,
        title: 'Instant Payments',
        description: 'Integrated payment links let clients pay directly from the invoice with one click.',
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-400',
    },
    {
        icon: <BarChart3 className="w-6 h-6" />,
        title: 'Real-Time Analytics',
        description: 'Track revenue, outstanding payments, and cash flow with beautiful interactive dashboards.',
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-400',
    },
    {
        icon: <Globe className="w-6 h-6" />,
        title: 'Multi-Currency',
        description: 'Support for 150+ currencies with automatic exchange rate conversion for global invoicing.',
        color: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-cyan-500/10',
        textColor: 'text-cyan-400',
    },
    {
        icon: <Bell className="w-6 h-6" />,
        title: 'Smart Reminders',
        description: 'Automated payment reminders via email and SMS reduce late payments by up to 70%.',
        color: 'from-rose-500 to-rose-600',
        bgColor: 'bg-rose-500/10',
        textColor: 'text-rose-400',
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: 'Bank-Grade Security',
        description: 'End-to-end encryption and SOC 2 compliance ensure your financial data stays protected.',
        color: 'from-teal-500 to-teal-600',
        bgColor: 'bg-teal-500/10',
        textColor: 'text-teal-400',
    },
    {
        icon: <Clock className="w-6 h-6" />,
        title: 'Recurring Invoices',
        description: 'Set up automatic recurring invoices for subscription-based clients and retainer contracts.',
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-500/10',
        textColor: 'text-orange-400',
    },
];

function FeatureCard({ feature, index }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="group relative"
        >
            <div className="glass-card glass-card-hover rounded-2xl p-7 h-full transition-all duration-500 cursor-pointer">
                {/* Icon */}
                <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <span className={feature.textColor}>{feature.icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
                    {feature.title}
                    <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all opacity-0 group-hover:opacity-100" />
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {feature.description}
                </p>

                {/* Bottom gradient line */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-3/4 bg-gradient-to-r ${feature.color} transition-all duration-500 rounded-full`} />
            </div>
        </motion.div>
    );
}

export default function Features() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section id="features" className="relative py-32 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 grid-pattern opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[150px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div ref={sectionRef} className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-6"
                    >
                        <Zap className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-indigo-300 font-medium">Powerful Features</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-6 leading-tight"
                    >
                        Everything You Need to{' '}
                        <span className="gradient-text">Get Paid Faster</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-400 leading-relaxed"
                    >
                        From creation to payment, InvoiceFlow handles every step of your invoicing
                        workflow with intelligent automation.
                    </motion.p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((feature, index) => (
                        <FeatureCard key={feature.title} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
