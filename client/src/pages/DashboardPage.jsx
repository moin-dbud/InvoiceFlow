import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import {
    IndianRupee, TrendingUp, ShoppingCart, FileStack, Receipt,
    AlertTriangle, Package, Plus, ArrowUpRight,
    Boxes, Eye, ChevronRight, Users, Loader2
} from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

// Chart color palette
const COLORS = {
    indigo: '#818cf8', purple: '#a78bfa', emerald: '#34d399',
    amber: '#fbbf24', rose: '#fb7185', cyan: '#22d3ee',
};

const PIE_COLORS = [COLORS.emerald, COLORS.amber, COLORS.rose];

// Custom Recharts tooltip
const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-bold text-white">{prefix}{Number(payload[0].value).toLocaleString('en-IN')}</p>
        </div>
    );
};

const statusStyles = {
    generated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/dashboard/stats`, authHeader());
            if (data.success) setStats(data.stats);
        } catch (err) {
            console.error('Dashboard stats error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const invoiceStatusData = stats ? [
        { name: 'Generated', value: stats.statusCounts.generated, color: COLORS.emerald },
        { name: 'Draft', value: stats.statusCounts.draft, color: COLORS.amber },
        { name: 'Cancelled', value: stats.statusCounts.cancelled, color: COLORS.rose },
    ].filter(d => d.value > 0) : [];

    const kpis = stats ? [
        {
            label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
            icon: <IndianRupee className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10'
        },
        {
            label: 'Invoices Raised', value: String(stats.totalInvoices),
            icon: <FileStack className="w-5 h-5" />, color: 'text-purple-400', bg: 'bg-purple-500/10'
        },
        {
            label: 'GST Collected', value: `₹${stats.totalGst.toLocaleString('en-IN')}`,
            icon: <Receipt className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10'
        },
        {
            label: 'Total Customers', value: String(stats.customerCount),
            icon: <Users className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10'
        },
        {
            label: 'Total Stock', value: String(stats.totalStock),
            icon: <ShoppingCart className="w-5 h-5" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10'
        },
        {
            label: 'Low Stock Alerts', value: String(stats.lowStockProducts.length),
            icon: <AlertTriangle className="w-5 h-5" />,
            color: stats.lowStockProducts.length > 0 ? 'text-red-400' : 'text-gray-400',
            bg: stats.lowStockProducts.length > 0 ? 'bg-red-500/10' : 'bg-gray-500/10'
        },
    ] : [];

    const isFirstTime = stats && stats.totalProducts === 0 && stats.totalInvoices === 0;

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-[1400px] mx-auto">
                {/* Greeting */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-display font-extrabold text-white">
                        Welcome{user?.showroomName ? `, ${user.showroomName}` : ''} 👋🏻
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Here's your business overview</p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* First-time CTA */}
                        {isFirstTime && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="mb-8 relative overflow-hidden glass-card rounded-2xl p-8 sm:p-10">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10" />
                                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Package className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="text-xl font-display font-bold text-white mb-2">Get Started — Add Your Products</h3>
                                        <p className="text-gray-400 text-sm max-w-lg">
                                            Start by adding your E-Vehicles and accessories. These will appear when creating invoices.
                                        </p>
                                    </div>
                                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => navigate('/products')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 flex-shrink-0">
                                        <Plus className="w-5 h-5" /> Add Products
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                            {kpis.map((kpi, i) => (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card glass-card-hover rounded-xl p-5 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center ${kpi.color}`}>
                                            {kpi.icon}
                                        </div>
                                    </div>
                                    <p className={`text-xl font-display font-bold ${kpi.color}`}>{kpi.value}</p>
                                    <p className="text-xs text-gray-600 mt-1">{kpi.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Monthly Revenue Bar Chart */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="lg:col-span-2 glass-card rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-white">Monthly Revenue</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Last 12 months</p>
                                    </div>
                                </div>
                                {stats?.monthlyRevenue?.some(m => m.revenue > 0) ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={stats.monthlyRevenue} barCategoryGap="20%">
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={false} tickLine={false}
                                                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                                            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="url(#barGradient)" />
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={COLORS.indigo} />
                                                    <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0.6} />
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[260px] text-center">
                                        <TrendingUp className="w-10 h-10 text-gray-700 mb-3" />
                                        <p className="text-sm text-gray-500">Revenue data will appear here once you generate invoices</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* Invoice Status Pie Chart */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="glass-card rounded-2xl p-6">
                                <h3 className="text-lg font-display font-bold text-white mb-1">Invoice Status</h3>
                                <p className="text-xs text-gray-500 mb-4">Distribution breakdown</p>
                                {invoiceStatusData.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={210}>
                                            <PieChart>
                                                <Pie data={invoiceStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                                    paddingAngle={4} dataKey="value" strokeWidth={0}>
                                                    {invoiceStatusData.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{
                                                    backgroundColor: '#12121f', border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px', fontSize: '12px', color: '#fff'
                                                }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {invoiceStatusData.map((item) => (
                                                <div key={item.name} className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-xs text-gray-400">{item.name}</span>
                                                    <span className="text-xs font-bold text-white ml-auto">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[260px] text-center">
                                        <FileStack className="w-10 h-10 text-gray-700 mb-3" />
                                        <p className="text-sm text-gray-500">No invoices yet</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Low Stock Alerts */}
                        {stats?.lowStockProducts?.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                                className="glass-card rounded-2xl p-6 mb-8">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-display font-bold text-white">Low Stock Alerts</h3>
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {stats.lowStockProducts.map(p => (
                                        <div key={p._id} className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {p.images?.[0] ? (
                                                    <img src={p.images[0]} alt="" className="w-full h-full rounded-lg object-cover" />
                                                ) : (
                                                    <Boxes className="w-5 h-5 text-amber-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-white truncate">{p.name}</p>
                                                <p className="text-xs text-amber-400">{p.stock} units left</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Recent Invoices Table */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="glass-card rounded-2xl p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-display font-bold text-white">Recent Invoices</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Latest activity</p>
                                </div>
                                <button onClick={() => navigate('/invoices')}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
                                    View All <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {stats?.recentInvoices?.length > 0 ? (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden sm:block overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/5">
                                                    {['Invoice', 'Customer', 'Amount', 'Status', 'Date', ''].map(h => (
                                                        <th key={h} className="text-left text-xs font-medium text-gray-500 pb-3 px-3 first:pl-0">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recentInvoices.map((inv) => (
                                                    <tr key={inv._id} onClick={() => navigate('/invoices')}
                                                        className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors cursor-pointer group">
                                                        <td className="py-3.5 px-3 first:pl-0">
                                                            <span className="text-sm font-medium text-indigo-400">{inv.invoiceNumber}</span>
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <span className="text-sm text-gray-300">{inv.customerName}</span>
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <span className="text-sm font-medium text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</span>
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusStyles[inv.status] || ''}`}>
                                                                {inv.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <Eye className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="sm:hidden space-y-3">
                                        {stats.recentInvoices.slice(0, 5).map((inv) => (
                                            <div key={inv._id} onClick={() => navigate('/invoices')}
                                                className="bg-white/[0.02] rounded-xl p-4 border border-white/5 cursor-pointer">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-indigo-400">{inv.invoiceNumber}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles[inv.status] || ''}`}>
                                                        {inv.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300 mb-1">{inv.customerName}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</span>
                                                    <span className="text-xs text-gray-600">
                                                        {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileStack className="w-10 h-10 text-gray-700 mb-3" />
                                    <p className="text-sm text-gray-500">No invoices yet — generate your first invoice!</p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
