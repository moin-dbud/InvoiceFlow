import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Zap, LayoutDashboard, Package, FileStack,
    Users, LogOut, ChevronLeft, ChevronRight, Menu, X, Settings
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Invoices', href: '/invoices', icon: FileStack },
    { name: 'Customers', href: '/customers', icon: Users },
];

export default function DashboardLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
        else navigate('/login');
    }, [navigate]);

    // Listen for profile updates
    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem('user');
            if (stored) setUser(JSON.parse(stored));
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userUpdated', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdated', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    const isProfileActive = location.pathname === '/profile';

    return (
        <div className="min-h-screen bg-[#06060b] flex font-sans">
            {/* ====== SIDEBAR ====== */}
            <aside className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/5 bg-[#08080f] transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>

                {/* Logo */}
                <div className="h-20 flex items-center gap-2.5 px-5 border-b border-white/5 flex-shrink-0">
                    <Link to="/dashboard" className="flex items-center gap-2.5">
                        <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                            <FileText className="w-5 h-5 text-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                                <Zap className="w-1.5 h-1.5 text-amber-900" />
                            </div>
                        </div>
                        {!collapsed && (
                            <span className="text-lg font-display font-bold text-white tracking-tight">
                                Invoice<span className="text-indigo-400">Flow</span>
                            </span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map(item => {
                        const active = location.pathname === item.href;
                        return (
                            <Link key={item.name} to={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/[0.03] border border-transparent'
                                    }`}
                                title={collapsed ? item.name : undefined}>
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? '' : 'group-hover:text-indigo-400'} transition-colors`} />
                                {!collapsed && item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section: Collapse + Logout + Profile */}
                <div className="flex-shrink-0 border-t border-white/5">
                    {/* Collapse & Logout buttons */}
                    <div className="px-3 py-3 space-y-1">
                        <button onClick={() => setCollapsed(!collapsed)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all"
                            title={collapsed ? 'Expand' : 'Collapse'}>
                            {collapsed ? <ChevronRight className="w-5 h-5 flex-shrink-0" /> : <><ChevronLeft className="w-5 h-5 flex-shrink-0" /> Collapse</>}
                        </button>
                        <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                            title={collapsed ? 'Logout' : undefined}>
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && 'Logout'}
                        </button>
                    </div>

                    {/* Dealer Profile Card — clickable */}
                    <Link to="/profile"
                        className={`block mx-3 mb-3 p-3 rounded-xl border transition-all duration-200 group cursor-pointer ${isProfileActive
                            ? 'bg-indigo-500/10 border-indigo-500/20'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                            }`}
                        title={collapsed ? `${user.showroomName} — View Profile` : undefined}>
                        <div className="flex items-center gap-3">
                            {/* Logo / Initial Avatar */}
                            {user.dealerLogo ? (
                                <img
                                    src={user.dealerLogo}
                                    alt={user.showroomName}
                                    className={`rounded-lg object-cover flex-shrink-0 border border-white/10 ${collapsed ? 'w-10 h-10' : 'w-10 h-10'}`}
                                />
                            ) : (
                                <div className={`bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 ${collapsed ? 'w-10 h-10 text-sm' : 'w-10 h-10 text-sm'}`}>
                                    {user.showroomName?.charAt(0)?.toUpperCase() || 'D'}
                                </div>
                            )}

                            {/* Text */}
                            {!collapsed && (
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-semibold truncate ${isProfileActive ? 'text-indigo-400' : 'text-white group-hover:text-white'}`}>
                                        {user.showroomName}
                                    </p>
                                    <p className="text-[11px] text-gray-600 truncate">{user.gstin}</p>
                                </div>
                            )}

                            {/* Settings icon */}
                            {!collapsed && (
                                <Settings className={`w-4 h-4 flex-shrink-0 transition-colors ${isProfileActive ? 'text-indigo-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                            )}
                        </div>
                    </Link>
                </div>
            </aside>

            {/* ====== MOBILE HEADER ====== */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-[#08080f]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-display font-bold text-white">Invoice<span className="text-indigo-400">Flow</span></span>
                </Link>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400 hover:text-white p-2">
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile menu overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-[#06060b]/95 backdrop-blur-xl pt-16">
                    <nav className="p-4 space-y-1">
                        {navItems.map(item => (
                            <Link key={item.name} to={item.href} onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${location.pathname === item.href ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:text-white'
                                    }`}>
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        ))}

                        <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
                            {/* Mobile Profile link */}
                            <Link to="/profile" onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${isProfileActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:text-white'
                                    }`}>
                                {user?.dealerLogo ? (
                                    <img src={user.dealerLogo} alt="" className="w-6 h-6 rounded-md object-cover" />
                                ) : (
                                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
                                        {user?.showroomName?.charAt(0) || 'D'}
                                    </div>
                                )}
                                Profile Settings
                            </Link>
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400">
                                <LogOut className="w-5 h-5" /> Logout
                            </button>
                        </div>
                    </nav>
                </div>
            )}

            {/* ====== MAIN CONTENT ====== */}
            <main className="flex-1 overflow-y-auto lg:pt-0 pt-16">
                {children}
            </main>
        </div>
    );
}
