"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Target,
    Map,
    Brain,
    Briefcase,
    BookOpen,
    Library,
    BarChart3,
    TrendingUp,
    LogOut,
    User,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    Bell,
    Settings,
    Command,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Target, label: 'JD Synergist', href: '/dashboard/synergy' },
    { icon: Map, label: 'Roadmaps', href: '/dashboard/roadmaps' },
    { icon: Brain, label: 'AI Coach', href: '/dashboard/career-coach' },
    { icon: Briefcase, label: 'My Interview', href: '/dashboard/my-interview' },
    { icon: BookOpen, label: 'Laboratories', href: '/dashboard/tests' },
    { icon: Library, label: 'Resources', href: '/dashboard/resources' },
    { icon: BarChart3, label: 'Performance', href: '/dashboard/performance' },
    { icon: TrendingUp, label: 'Market Intel', href: '/dashboard/market' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) { window.location.href = '/auth/login'; return; }
            try {
                const response = await api.get('/api/onboarding/status');
                if (response.data && !response.data.onboarding_completed && pathname !== '/dashboard/onboarding') {
                    window.location.href = '/dashboard/onboarding'; return;
                }
                const userRes = await api.get('/api/auth/me');
                setUser(userRes.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/auth/login';
                }
            }
        };
        checkStatus();
    }, [pathname]);

    const currentLabel = sidebarItems.find(i => i.href === pathname)?.label || 'Dashboard';

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

            {/* ── Desktop Sidebar ── */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 72 : 256 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="hidden lg:flex flex-col shrink-0 z-40 overflow-hidden"
                style={{
                    background: 'var(--sidebar-bg)',
                    borderRight: '1px solid var(--sidebar-border)',
                }}
            >
                {/* Logo */}
          <div
            className={`h-16 flex items-center justify-center shrink-0 ${isCollapsed ? 'px-1' : 'px-4'}`}
            style={{ borderBottom: '1px solid var(--sidebar-border)' }}
          >
            <img
              src="/talvix_logo.png"
              alt="Talvix"
              className={`w-auto object-contain ${isCollapsed ? 'h-8' : 'h-10'}`}
            />
          </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar space-y-0.5">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    title={isCollapsed ? item.label : ''}
                                    className={`flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer relative group ${isCollapsed ? 'justify-center px-0 py-3 mx-1' : 'px-3 py-2.5'}`}
                                    style={{
                                        background: isActive ? 'rgba(var(--accent-blue-rgb, 37,99,235), 0.08)' : 'transparent',
                                        color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                    }}
                                    onMouseEnter={e => {
                                        if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-hover)';
                                        if (!isActive) (e.currentTarget as HTMLDivElement).style.color = 'var(--text-primary)';
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                                        if (!isActive) (e.currentTarget as HTMLDivElement).style.color = 'var(--text-secondary)';
                                    }}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                                            style={{ background: 'var(--accent-blue)' }}
                                        />
                                    )}
                                    <item.icon
                                        className="shrink-0"
                                        size={18}
                                        strokeWidth={isActive ? 2.2 : 1.8}
                                    />
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.05 }}
                                            className="text-sm font-semibold whitespace-nowrap truncate"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom user section */}
                <div className="p-3 shrink-0 space-y-2" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
                    {/* Collapse toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`w-full flex items-center rounded-xl py-2 transition-all text-sm font-semibold ${isCollapsed ? 'justify-center' : 'justify-between px-3'}`}
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                        }}
                    >
                        {!isCollapsed && <span className="text-xs uppercase tracking-widest font-bold">Collapse</span>}
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>

                    {/* User mini card */}
                    {!isCollapsed ? (
                        <div className="rounded-xl p-3 space-y-3" style={{ background: 'var(--surface-hover)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg talvix-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.full_name || 'User'}</p>
                                    <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{user?.target_role || 'Career Member'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href="/dashboard/profile" className="flex-1">
                                    <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                                        style={{ color: 'var(--text-secondary)', background: 'var(--card-bg)' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.color = 'var(--accent-blue)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.color = 'var(--text-secondary)'}
                                    >
                                        <User size={12} /> Profile
                                    </div>
                                </Link>
                                <button
                                    onClick={() => { localStorage.removeItem('token'); window.location.href = '/auth/login'; }}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                                    style={{ color: '#ef4444', background: 'var(--card-bg)' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--card-bg)'}
                                >
                                    <LogOut size={12} /> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-2">
                            <button onClick={() => window.location.href = '/dashboard/profile'}
                                className="p-2 rounded-lg transition-all"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                            >
                                <User size={16} />
                            </button>
                            <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/auth/login'; }}
                                className="p-2 rounded-lg transition-all"
                                style={{ color: '#ef4444' }}
                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'}
                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* ── Content Area ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Topbar */}
                <header
                    className="h-16 px-6 flex items-center justify-between shrink-0 z-30"
                    style={{
                        background: 'var(--sidebar-bg)',
                        borderBottom: '1px solid var(--sidebar-border)',
                    }}
                >
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-1 rounded-xl transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                        >
                            <Menu size={20} />
                        </button>

                        {/* Breadcrumb */}
                        <div className="hidden md:flex items-center gap-2 text-sm">
                            <span style={{ color: 'var(--text-muted)' }} className="text-xs font-medium">Talvix</span>
                            <span style={{ color: 'var(--text-muted)' }}>/</span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{currentLabel}</span>
                        </div>

                        {/* Search */}
                        <div
                            className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-xl border ml-4 max-w-xs w-full transition-all group focus-within:border-blue-500/50"
                            style={{ background: 'var(--background)', borderColor: 'var(--card-border)' }}
                        >
                            <Search size={14} style={{ color: 'var(--text-muted)' }} />
                            <input
                                placeholder="Search..."
                                className="bg-transparent border-none text-sm w-full focus:ring-0 outline-none"
                                style={{ color: 'var(--text-primary)' }}
                            />
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                                style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
                                ⌘K
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-xl transition-all hidden sm:block"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                        >
                            <Bell size={18} />
                        </button>
                        <ThemeToggle />
                        <div className="w-px h-5 hidden sm:block" style={{ background: 'var(--sidebar-border)' }} />
                        <div
                            className="flex items-center gap-2.5 cursor-pointer"
                            onClick={() => window.location.href = '/dashboard/profile'}
                        >
                            <div className="w-8 h-8 rounded-full talvix-gradient flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{user?.full_name?.split(' ')[0] || 'User'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto no-scrollbar" style={{ background: 'var(--background)' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="p-6 lg:p-8"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* ── Mobile Sidebar ── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="fixed top-0 left-0 bottom-0 w-72 z-[110] flex flex-col"
                            style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
                        >
                            <div className="h-16 flex items-center justify-between px-5" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 talvix-gradient rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
                                    <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>Talvix</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl transition-all" style={{ color: 'var(--text-secondary)' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
                                {sidebarItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                            <div
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                                style={{
                                                    background: isActive ? 'var(--accent-blue)' : 'transparent',
                                                    color: isActive ? '#fff' : 'var(--text-secondary)',
                                                }}
                                            >
                                                <item.icon size={18} />
                                                {item.label}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="p-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
                                <button
                                    onClick={() => { localStorage.removeItem('token'); window.location.href = '/auth/login'; }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                    style={{ color: '#ef4444' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                                >
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
