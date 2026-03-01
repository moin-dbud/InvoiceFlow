import { motion } from 'framer-motion';
import { FileText, Zap, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const links = {
    Product: ['Features', 'Pricing', 'Templates', 'Integrations', 'API'],
    Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
    Resources: ['Documentation', 'Help Center', 'Community', 'Changelog', 'Status'],
    Legal: ['Privacy', 'Terms', 'Security', 'GDPR', 'Cookies'],
};

export default function Footer() {
    return (
        <footer className="relative border-t border-white/5 overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/5 rounded-full blur-[150px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
                {/* CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative glass-card rounded-3xl p-10 sm:p-14 mb-20 overflow-hidden text-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10" />
                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">
                            Ready to Streamline Your <span className="gradient-text">Invoicing?</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                            Join 50,000+ businesses creating professional invoices effortlessly.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl text-lg shadow-2xl shadow-indigo-500/25">
                                Get Started — It's Free
                            </motion.button>
                            <span className="text-sm text-gray-500">No credit card required</span>
                        </div>
                    </div>
                </motion.div>

                {/* Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
                    <div className="col-span-2 md:col-span-1">
                        <a href="#home" className="flex items-center gap-2.5 mb-5">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-display font-bold text-white">
                                Invoice<span className="text-indigo-400">Flow</span>
                            </span>
                        </a>
                        <p className="text-sm text-gray-500 leading-relaxed mb-5">
                            The smartest way to create, send, and track invoices.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {Object.entries(links).map(([title, items]) => (
                        <div key={title}>
                            <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
                            <ul className="space-y-2.5">
                                {items.map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600">
                        © 2026 InvoiceFlow. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for businesses everywhere
                    </p>
                </div>
            </div>
        </footer>
    );
}
