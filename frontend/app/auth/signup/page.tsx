"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

const perks = [
    'AI-powered resume analysis',
    'Personalized career roadmaps',
    'Mock interviews & coaching',
    'Skill gap detection',
    'Job market intelligence',
];

export default function SignupPage() {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/signup', { email, password, full_name: name });
            window.location.href = '/auth/login';
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
                            className="absolute h-px"
                            style={{
                                left: 0, right: 0,
                                top: `${(i / 20) * 100}%`,
                                background: 'rgba(255,255,255,0.3)'
                            }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1.5, delay: i * 0.05, ease: 'easeOut' }}
                        />
                    ))}
                </div>
                <div className="relative z-10">
                    <div className="flex items-center">
                        <img src="/talvix_logo.png" alt="Talvix" className="h-16 w-auto brightness-0 invert drop-shadow-lg" />
                    </div>
                </div>
                <div className="relative z-10 space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-black text-white leading-tight">
                            Start your career<br />journey today.
                        </h2>
                        <p className="text-blue-100 text-lg font-medium">
                            Get instant access to AI-powered career tools.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {perks.map((perk) => (
                            <div key={perk} className="flex items-center gap-3">
                                <CheckCircle size={18} className="text-blue-200 shrink-0" />
                                <span className="text-blue-100 font-medium text-sm">{perk}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative z-10 p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                    <p className="text-white font-medium text-sm italic">"Talvix helped me land a senior engineering role at a top firm in just 6 weeks!"</p>
                    <p className="text-blue-100 text-xs mt-2 font-semibold">— Talvix User</p>
                </div>
            </div>

            {/* Right: form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6">
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
                    <div className="lg:hidden flex items-center justify-center mb-8">
                        <img src="/talvix_logo.png" alt="Talvix" className="h-10 w-auto" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Create your account</h1>
                        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Start your career intelligence journey — free.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3.5 rounded-xl text-xs font-semibold"
                                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><User size={16} /></div>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                    placeholder="Jane Smith"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                                    style={{ background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--accent-blue)'}
                                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--card-border)'} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Email</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><Mail size={16} /></div>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                                    style={{ background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--accent-blue)'}
                                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--card-border)'} />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><Lock size={16} /></div>
                                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    className="w-full pl-11 pr-12 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                                    style={{ background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--accent-blue)'}
                                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--card-border)'} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-all"
                                    style={{ color: 'var(--text-muted)' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-bold text-white talvix-gradient transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                            style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Create Account</span> <ArrowRight size={16} /></>}
                        </button>

                        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                            By signing up, you agree to our{' '}
                            <Link href="#" style={{ color: 'var(--accent-blue)' }} className="font-semibold">Terms</Link>
                            {' & '}
                            <Link href="#" style={{ color: 'var(--accent-blue)' }} className="font-semibold">Privacy Policy</Link>
                        </p>
                    </form>

                    <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-semibold" style={{ color: 'var(--accent-blue)' }}>
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
