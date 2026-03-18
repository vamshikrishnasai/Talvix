"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/api/auth/login',
                new URLSearchParams({ username: email, password }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            localStorage.setItem('token', response.data.access_token);
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 talvix-gradient">
                <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div key={i}
                            className="absolute w-px"
                            style={{
                                left: `${(i / 20) * 100}%`,
                                top: 0, bottom: 0,
                                background: 'rgba(255,255,255,0.3)'
                            }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 1.5, delay: i * 0.05, ease: 'easeOut' }}
                        />
                    ))}
                </div>
                <div className="relative z-10">
                    <div className="flex items-center">
                        <img src="/talvix_logo_.png" alt="Talvix" className="h-28 w-auto brightness-0 invert drop-shadow-xl" />
                    </div>
                </div>
                <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl font-black text-white leading-tight">
                        Your AI-powered<br />career command center.
                    </h2>
                    <p className="text-blue-100 text-lg font-medium max-w-sm">
                        Resume intelligence, gap analysis, roadmaps, and mock interviews — all in one place.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {['Resume AI', 'JD Synergist', 'AI Coach', 'Mock Interviews', 'Roadmaps'].map((tag) => (
                            <span key={tag} className="px-4 py-2 bg-white/15 rounded-xl text-white text-xs font-bold backdrop-blur-sm border border-white/20">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="relative z-10 flex gap-6">
                    {[['98.4%', 'Accuracy'], ['50k+', 'Analyses'], ['12k+', 'Mock Rounds']].map(([val, label]) => (
                        <div key={label}>
                            <p className="text-white text-2xl font-black">{val}</p>
                            <p className="text-blue-100 text-xs font-medium">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6">
                {/* Top nav */}
                <div className="absolute top-6 right-6 flex items-center gap-3">
                    <Link href="/">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{ color: 'var(--text-secondary)', background: 'var(--surface-hover)' }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}>
                            <ArrowLeft size={15} /> Back
                        </button>
                    </Link>
                    <ThemeToggle />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-full max-w-[400px] space-y-8"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center mb-8">
                        <img src="/talvix_logo_.png" alt="Talvix" className="h-16 w-auto" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
                        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to continue your career journey.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3.5 rounded-xl text-xs font-semibold"
                                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Email</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email" required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                                    style={{ background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--accent-blue)'}
                                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--card-border)'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Password</label>
                                <Link href="#" className="text-xs font-semibold" style={{ color: 'var(--accent-blue)' }}>Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'} required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-12 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                                    style={{ background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--accent-blue)'}
                                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--card-border)'}
                                />
                                <button type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-all"
                                    style={{ color: 'var(--text-muted)' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-bold text-white talvix-gradient transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                            style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Sign In</span> <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        New to Talvix?{' '}
                        <Link href="/auth/signup" className="font-semibold" style={{ color: 'var(--accent-blue)' }}>
                            Create an account
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
