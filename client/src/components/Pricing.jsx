import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, Sparkles, Zap, Building2, ArrowRight } from 'lucide-react';

const plans = [
    {
        name: 'Starter',
        desc: 'Perfect for freelancers',
        mp: 0, yp: 0,
        features: ['10 invoices/month', '3 templates', 'Basic analytics', 'Email support', 'PDF downloads', 'Single user'],
        cta: 'Start Free', popular: false,
        icon: <Zap className="w-6 h-6" />,
        color: 'text-gray-400', grad: 'from-gray-600 to-gray-700',
    },
    {
        name: 'Professional',
        desc: 'Best for growing businesses',
        mp: 19, yp: 15,
        features: ['Unlimited invoices', 'All 50+ templates', 'Advanced analytics', 'Priority support', 'Payment integrations', 'Recurring invoices', 'Multi-currency', 'Team (5 users)'],
        cta: 'Start Free Trial', popular: true,
        icon: <Sparkles className="w-6 h-6" />,
        color: 'text-indigo-400', grad: 'from-indigo-600 to-purple-600',
    },
    {
        name: 'Enterprise',
        desc: 'For large teams',
        mp: 49, yp: 39,
        features: ['Everything in Pro', 'White-label branding', 'API access', 'Dedicated manager', 'SSO & security', 'Unlimited members', 'Custom integrations', 'SLA guarantee'],
        cta: 'Contact Sales', popular: false,
        icon: <Building2 className="w-6 h-6" />,
        color: 'text-amber-400', grad: 'from-amber-600 to-orange-600',
    },
];

export default function Pricing() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });
    const [yearly, setYearly] = useState(false);

    return (
        <section id="pricing" className="relative py-32 overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/5 rounded-full blur-[180px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                <div ref={ref} className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-amber-300 font-medium">Simple Pricing</span>
                    </motion.div>

                    <motion.h2 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-6 leading-tight">
                        Plans That Scale With <span className="gradient-text-gold">Your Business</span>
                    </motion.h2>

                    <motion.p initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-400 leading-relaxed">
                        Start free and upgrade as you grow. No hidden fees.
                    </motion.p>

                    <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-4 mt-10">
                        <span className={`text-sm font-medium ${!yearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
                        <button onClick={() => setYearly(!yearly)}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${yearly ? 'bg-indigo-600' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${yearly ? 'left-8' : 'left-1'}`} />
                        </button>
                        <span className={`text-sm font-medium ${yearly ? 'text-white' : 'text-gray-500'}`}>
                            Yearly <span className="ml-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Save 20%</span>
                        </span>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className={`relative ${plan.popular ? 'md:-mt-4 md:mb-[-16px]' : ''}`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                    <div className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-500/30">
                                        ✨ Most Popular
                                    </div>
                                </div>
                            )}
                            <div className={`glass-card rounded-2xl p-8 h-full transition-all duration-500 hover:border-indigo-500/20 ${plan.popular ? 'border-indigo-500/25 glow-indigo' : ''}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${plan.grad} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-display font-bold text-white">{plan.name}</h3>
                                        <p className="text-xs text-gray-500">{plan.desc}</p>
                                    </div>
                                </div>
                                <div className="my-6 py-6 border-y border-white/5">
                                    <div className="flex items-end gap-1">
                                        <span className="text-5xl font-display font-extrabold text-white">${yearly ? plan.yp : plan.mp}</span>
                                        <span className="text-gray-500 mb-2 text-sm">/mo</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                                            <Check className={`w-4 h-4 flex-shrink-0 ${plan.color}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${plan.popular
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                        }`}>
                                    {plan.cta}
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-12">All plans include a 14-day free trial. No credit card required.</p>
            </div>
        </section>
    );
}
