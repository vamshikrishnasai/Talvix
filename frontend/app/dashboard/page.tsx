"use client"

import React, { useState, useEffect } from 'react';
import {
    Target, Zap, Building2, Globe, Search, Loader2,
    Edit2, X, TrendingUp, Upload, Brain, Sparkles,
    CheckCircle2, Briefcase, BarChart3, ArrowRight,
    Flame, Calendar, ExternalLink, Newspaper, Hash,
    Award, Clock, Users, Github, Linkedin, Link, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

/** Safely coerce an AI response item to a string */
const safeStr = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'object') {
        return val.skill || val.text || val.title || val.name || val.description ||
            val.recommendation || val.category || val.question ||
            Object.values(val).filter((v: any) => typeof v === 'string').join(' · ') ||
            JSON.stringify(val);
    }
    return String(val);
};

// ─── Shared style helpers ───────────────────────────────────
const card = {
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '1.25rem',
};

const surfaceInner = {
    background: 'var(--background)',
    border: '1px solid var(--card-border)',
    borderRadius: '0.75rem',
};

const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: 'var(--text-muted)',
};

// ─── Subcomponents ───────────────────────────────────────────
function StatRow({ icon: Icon, label, value, color }: any) {
    return (
        <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}14` }}>
                    <Icon size={14} style={{ color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}

function PillTag({ text, color, bg, border }: { text: string; color: string; bg: string; border: string }) {
    return (
        <span className="pill-tag" style={{ color, background: bg, border: `1px solid ${border}` }}>
            {text}
        </span>
    );
}

// ─── Main Page ───────────────────────────────────────────────
export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [loadingCompany, setLoadingCompany] = useState(false);
    const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ target_role: '', target_company: '', prep_duration: 4, user_type: '' });
    const [isUploading, setIsUploading] = useState(false);
    
    // Social Analysis State
    const [socialUrls, setSocialUrls] = useState({ linkedin: '', github: '' });
    const [socialAnalysis, setSocialAnalysis] = useState<any>(null);
    const [analyzingSocial, setAnalyzingSocial] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [uRes, resumeRes] = await Promise.all([
                api.get('/api/auth/me'),
                api.get('/api/resume/my-resumes')
            ]);
            setUser(uRes.data);
            setEditForm({
                target_role: uRes.data.target_role || '',
                target_company: uRes.data.target_company || '',
                prep_duration: uRes.data.prep_duration || 4,
                user_type: uRes.data.user_type || 'STUDENT'
            });
            if (resumeRes.data.length > 0) {
                setResumeAnalysis(resumeRes.data[resumeRes.data.length - 1]);
            }
            if (uRes.data.target_company) {
                fetchCompanyInsights(uRes.data.target_company);
            }
            setSocialUrls({
                linkedin: uRes.data.linkedin_url || '',
                github: uRes.data.github_url || ''
            });
            if (uRes.data.linkedin_url || uRes.data.github_url) {
                handleSocialAnalyze(uRes.data.linkedin_url, uRes.data.github_url);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setIsUploading(true);
        try {
            const res = await api.post('/api/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumeAnalysis(res.data);
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSocialAnalyze = async (linkedin = socialUrls.linkedin, github = socialUrls.github) => {
        if (!linkedin && !github) return;
        setAnalyzingSocial(true);
        try {
            const res = await api.post('/api/social/analyze-profile', { linkedin_url: linkedin, github_url: github });
            setSocialAnalysis(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzingSocial(false);
        }
    };

    const fetchCompanyInsights = async (name: string) => {
        setLoadingCompany(true);
        try {
            const res = await api.get(`/api/jd/company-insights/${encodeURIComponent(name)}`);
            setCompanyInfo(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCompany(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch('/api/auth/me', editForm);
            setIsEditModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const getGreeting = () => {
        const h = new Date().getHours();
        return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--accent-blue)' }} />
            <p style={labelStyle}>Initializing Command Center...</p>
        </div>
    );

    return (
        <div className="max-w-[1280px] mx-auto space-y-8 animate-fade-in">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {getGreeting()}, {user?.full_name?.split(' ')[0]} 👋
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Here's your career intelligence dashboard — personalized for{' '}
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
                            {user?.target_role || 'your role'}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Streak badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(249,115,22,0.08)', color: '#f97316', border: '1px solid rgba(249,115,22,0.15)' }}>
                        <Flame size={16} className="fill-orange-500" />
                        {user?.streak_count || 0} day streak
                    </div>
                    {/* Upload CTA */}
                    <label htmlFor="resume-up" className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer text-white talvix-gradient transition-all active:scale-95"
                        style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {isUploading ? 'Analyzing...' : 'Upload Resume'}
                        <input type="file" id="resume-up" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                    </label>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Upload, label: 'Sync Profile', sub: 'Upload new resume', onClick: () => document.getElementById('resume-up')?.click() },
                    { icon: Brain, label: 'Roadmaps', sub: 'View mission path', href: '/dashboard/roadmaps' },
                    { icon: Target, label: 'JD Synergist', sub: 'Match with a JD', href: '/dashboard/synergy' },
                    { icon: Briefcase, label: 'My Interview', sub: 'Prep & track', href: '/dashboard/my-interview' },
                ].map((a, i) => (
                    <div
                        key={i}
                        onClick={a.onClick || (() => a.href && (window.location.href = a.href))}
                        className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all group"
                        style={card}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-blue)';
                            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)';
                            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                        }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'var(--background)', color: 'var(--accent-blue)', border: '1px solid var(--card-border)' }}>
                            <a.icon size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{a.label}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main Grid ── */}
            <div className="grid lg:grid-cols-12 gap-6">

                {/* Left col */}
                <div className="lg:col-span-8 space-y-6">

                    {/* ATS Score Card */}
                    <div className="p-8 rounded-2xl relative overflow-hidden" style={card}>
                        <div className="absolute inset-0 talvix-gradient opacity-[0.025] pointer-events-none" />
                        <div className="relative flex flex-col md:flex-row items-center gap-10">

                            {/* Circular ring */}
                            <div className="shrink-0 relative w-44 h-44">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="88" cy="88" r="74" fill="transparent"
                                        stroke="var(--card-border)" strokeWidth="10" />
                                    <motion.circle
                                        initial={{ strokeDashoffset: 465 }}
                                        animate={{ strokeDashoffset: 465 - (465 * (resumeAnalysis?.ats_score || 0)) / 100 }}
                                        transition={{ duration: 1.4, ease: 'easeOut' }}
                                        cx="88" cy="88" r="74" fill="transparent"
                                        stroke="url(#scoreGrad)" strokeWidth="10"
                                        strokeDasharray={465} strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="var(--accent-blue)" />
                                            <stop offset="100%" stopColor="var(--accent-indigo)" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                                        {Math.round(resumeAnalysis?.ats_score || 0)}%
                                    </span>
                                    <span style={{ ...labelStyle, fontSize: '9px' }}>ATS Score</span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={16} style={{ color: 'var(--accent-blue)' }} />
                                        <h3 className="text-base font-bold uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                            Profile Intelligence
                                        </h3>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        Your profile is optimized for{' '}
                                        <strong style={{ color: 'var(--accent-blue)' }}>{user?.target_role || 'your target role'}</strong>.
                                        {resumeAnalysis?.ai_recommendations
                                            ? ' ' + resumeAnalysis.ai_recommendations.split('.')[0] + '.'
                                            : ' Upload a resume to begin your intelligence analysis.'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => window.location.href = '/dashboard/roadmaps'}
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white talvix-gradient transition-all active:scale-95"
                                        style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
                                    >
                                        View Roadmap
                                    </button>
                                    <button
                                        onClick={() => window.location.href = '/dashboard/synergy'}
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                        style={{ border: '1px solid var(--card-border)', color: 'var(--text-secondary)', background: 'transparent' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                                    >
                                        Gap Analysis
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills grid */}
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Core skills */}
                        <div className="p-6 rounded-2xl space-y-4" style={card}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Skills Found</span>
                                </div>
                                <span style={labelStyle}>{resumeAnalysis?.extracted_skills?.length || 0} skills</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {resumeAnalysis?.extracted_skills?.map((s: any, i: number) => (
                                    <PillTag key={i} text={safeStr(s)}
                                        color="#16a34a" bg="rgba(22,163,74,0.07)" border="rgba(22,163,74,0.15)" />
                                ))}
                                {(!resumeAnalysis?.extracted_skills || resumeAnalysis.extracted_skills.length === 0) && (
                                    <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Upload a resume to extract skills</p>
                                )}
                            </div>
                        </div>

                        {/* Gaps */}
                        <div className="p-6 rounded-2xl space-y-4" style={card}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Search size={16} style={{ color: 'var(--accent-blue)' }} />
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Skill Gaps</span>
                                </div>
                                <span style={labelStyle}>{resumeAnalysis?.missing_skills?.length || 0} missing</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {resumeAnalysis?.missing_skills?.map((s: any, i: number) => (
                                    <PillTag key={i} text={safeStr(s)}
                                        color="#d97706" bg="rgba(217,119,6,0.07)" border="rgba(217,119,6,0.15)" />
                                ))}
                                {(!resumeAnalysis?.missing_skills || resumeAnalysis.missing_skills.length === 0) && (
                                    <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No gaps detected — great!</p>
                                )}
                            </div>
                            {resumeAnalysis?.missing_skills?.length > 0 && (
                                <button
                                    onClick={() => window.location.href = '/dashboard/resources'}
                                    className="flex items-center gap-1.5 text-xs font-semibold pt-2 transition-all"
                                    style={{ color: 'var(--accent-blue)', borderTop: '1px solid var(--card-border)' }}
                                >
                                    View bridging resources <ArrowRight size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Market insight snapshots */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={16} style={{ color: 'var(--accent-blue)' }} />
                            <h3 style={{ ...labelStyle, color: 'var(--text-primary)', fontSize: '12px' }}>Market Insights</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { icon: BarChart3, title: 'Profile Match', value: 'High', sub: 'Matches 84% of top hiring criteria', color: '#6366f1' },
                                { icon: Zap, title: 'Trending Skill', value: '+14% Demand', sub: 'React & TypeScript peaking this quarter', color: '#f59e0b' },
                                { icon: Building2, title: 'Active Hiring', value: '7 Companies', sub: 'Currently recruiting for your role', color: '#22c55e' },
                            ].map((item, i) => (
                                <div key={i} className="p-5 rounded-xl space-y-3 group transition-all cursor-default"
                                    style={card}
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = item.color + '40'}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)'}
                                >
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                        style={{ background: item.color + '10', color: item.color }}>
                                        <item.icon size={16} />
                                    </div>
                                    <div>
                                        <p style={labelStyle}>{item.title}</p>
                                        <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right col */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Mission Control card */}
                    <div className="p-6 rounded-2xl space-y-5" style={card}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Mission Config</h3>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                                style={{ color: 'var(--accent-blue)', background: 'rgba(37,99,235,0.06)' }}
                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(37,99,235,0.12)'}
                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(37,99,235,0.06)'}
                            >
                                <Edit2 size={12} /> Edit
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { icon: Building2, label: 'Target Company', value: user?.target_company || 'Not set', color: 'var(--accent-blue)' },
                                { icon: Target, label: 'Target Role', value: user?.target_role || 'Not set', color: 'var(--accent-indigo)' },
                                { icon: Clock, label: 'Prep Timeline', value: `${user?.prep_duration || 4} weeks`, color: '#f59e0b' },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl"
                                    style={surfaceInner}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: row.color + '12', color: row.color }}>
                                        <row.icon size={15} />
                                    </div>
                                    <div className="min-w-0">
                                        <p style={{ ...labelStyle, fontSize: '9px' }}>{row.label}</p>
                                        <p className="text-xs font-semibold truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>{row.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => window.location.href = '/dashboard/career-coach'}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white talvix-gradient transition-all active:scale-95"
                        >
                            Ask AI Career Coach
                        </button>
                    </div>

                    {/* Company Intelligence Card */}
                    <div className="rounded-2xl overflow-hidden" style={card}>
                        <div className="px-6 py-4 flex items-center justify-between"
                            style={{ borderBottom: '1px solid var(--card-border)' }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg talvix-gradient flex items-center justify-center shrink-0">
                                    <Building2 size={15} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {user?.target_company || 'Company Intel'}
                                    </h3>
                                    <p style={{ ...labelStyle, fontSize: '9px' }}>Target Company</p>
                                </div>
                            </div>
                            {loadingCompany && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            {companyInfo ? (
                                <>
                                    {/* Basic info */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Founded', value: companyInfo.founded || '—', icon: Calendar },
                                            { label: 'Type', value: companyInfo.type || companyInfo.industry || '—', icon: Hash },
                                            { label: 'Employees', value: companyInfo.employees || '—', icon: Users },
                                            { label: 'HQ', value: companyInfo.headquarters || '—', icon: Globe },
                                        ].map((item, i) => (
                                            <div key={i} className="p-3 rounded-xl" style={surfaceInner}>
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <item.icon size={11} style={{ color: 'var(--text-muted)' }} />
                                                    <p style={{ ...labelStyle, fontSize: '9px' }}>{item.label}</p>
                                                </div>
                                                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 2026 Headlines */}
                                    {companyInfo.headlines && companyInfo.headlines.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-1.5">
                                                <Newspaper size={12} style={{ color: 'var(--accent-blue)' }} />
                                                <p style={{ ...labelStyle, fontSize: '9px' }}>Latest Headlines 2026</p>
                                            </div>
                                            <div className="space-y-2">
                                                {companyInfo.headlines.slice(0, 4).map((h: any, i: number) => (
                                                    <div key={i} className="flex gap-3 p-3 rounded-xl" style={surfaceInner}>
                                                        <span className="text-xs font-black shrink-0"
                                                            style={{ color: 'var(--accent-blue)' }}>
                                                            {String(i + 1).padStart(2, '0')}
                                                        </span>
                                                        <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{safeStr(h)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Key projects / contributions */}
                                    {companyInfo.projects && companyInfo.projects.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-1.5">
                                                <Award size={12} style={{ color: '#f59e0b' }} />
                                                <p style={{ ...labelStyle, fontSize: '9px' }}>Notable Projects</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {companyInfo.projects.slice(0, 6).map((p: any, i: number) => (
                                                    <PillTag key={i} text={safeStr(p)}
                                                        color="var(--accent-blue)" bg="rgba(37,99,235,0.06)" border="rgba(37,99,235,0.15)" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : !loadingCompany && (
                                <div className="text-center py-8 space-y-2">
                                    <Building2 size={28} className="mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {user?.target_company
                                            ? 'Fetching company intelligence...'
                                            : 'Set a target company to see insights here'}
                                    </p>
                                    {!user?.target_company && (
                                        <button onClick={() => setIsEditModalOpen(true)}
                                            className="text-xs font-semibold px-4 py-2 rounded-lg transition-all mt-2"
                                            style={{ color: 'var(--accent-blue)', background: 'rgba(37,99,235,0.08)' }}>
                                            Configure Mission
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social Profile Analyzer Card */}
                    <div className="rounded-2xl overflow-hidden" style={card}>
                        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-blue)', color: 'white' }}>
                                    <Globe size={15} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Social Presence</h3>
                                    <p style={{ ...labelStyle, fontSize: '9px' }}>Network Intelligence</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            {!socialAnalysis ? (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"><Linkedin size={14} /></div>
                                            <input 
                                                type="text" 
                                                placeholder="LinkedIn Profile URL" 
                                                value={socialUrls.linkedin}
                                                onChange={e => setSocialUrls(prev => ({ ...prev, linkedin: e.target.value }))}
                                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none"
                                                style={{ background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary"><Github size={14} /></div>
                                            <input 
                                                type="text" 
                                                placeholder="GitHub Profile URL" 
                                                value={socialUrls.github}
                                                onChange={e => setSocialUrls(prev => ({ ...prev, github: e.target.value }))}
                                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none"
                                                style={{ background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleSocialAnalyze()}
                                        disabled={analyzingSocial || (!socialUrls.linkedin && !socialUrls.github)}
                                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white talvix-gradient disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {analyzingSocial ? <Loader2 size={14} className="animate-spin" /> : <Link size={14} />}
                                        Analyze Profiles
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between p-3 rounded-xl" style={surfaceInner}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--accent-blue)' }}>
                                                <BarChart3 size={14} />
                                            </div>
                                            <div>
                                                <p style={{ ...labelStyle, fontSize: '9px' }}>Overall Presence</p>
                                                <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{socialAnalysis.overall_score}/100</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSocialAnalysis(null)} className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                                            Reset
                                        </button>
                                    </div>

                                    {socialAnalysis.linkedin?.analyzed && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 mb-1 text-blue-500">
                                                <Linkedin size={12} />
                                                <p style={{ ...labelStyle, fontSize: '9px' }}>LinkedIn Insights</p>
                                            </div>
                                            <div className="p-3 rounded-xl space-y-2" style={surfaceInner}>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span style={{ color: 'var(--text-secondary)' }}>Activeness</span>
                                                    <span className="font-bold">{socialAnalysis.linkedin.activeness_score}%</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span style={{ color: 'var(--text-secondary)' }}>Arrangement</span>
                                                    <span className="font-bold">{socialAnalysis.linkedin.profile_arrangement}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span style={{ color: 'var(--text-secondary)' }}>Open to Work Ready</span>
                                                    <span className="font-bold">{socialAnalysis.linkedin.open_to_work_ready ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-red-500" />}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {socialAnalysis.github?.analyzed && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-primary)' }}>
                                                <Github size={12} />
                                                <p style={{ ...labelStyle, fontSize: '9px' }}>GitHub Insights</p>
                                            </div>
                                            <div className="p-3 rounded-xl space-y-2" style={surfaceInner}>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span style={{ color: 'var(--text-secondary)' }}>Activeness</span>
                                                    <span className="font-bold">{socialAnalysis.github.activeness_score}%</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span style={{ color: 'var(--text-secondary)' }}>Projects Sufficient</span>
                                                    <span className="font-bold">{socialAnalysis.github.projects_sufficient ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-red-500" />}</span>
                                                </div>
                                                {socialAnalysis.github.key_technologies && (
                                                    <div className="pt-1 flex flex-wrap gap-1">
                                                        {socialAnalysis.github.key_technologies.slice(0, 3).map((t: string, i: number) => (
                                                            <span key={i} className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid var(--card-border)' }}>{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <p className="text-[11px] leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                                            "{socialAnalysis.summary}"
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Reconfigure Modal ── */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 8 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 8 }}
                            className="rounded-2xl p-8 max-w-md w-full relative"
                            style={{
                                background: 'var(--card-bg)',
                                border: '1px solid var(--card-border)',
                                boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
                            }}
                        >
                            <button onClick={() => setIsEditModalOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-lg transition-all"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'}
                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                            >
                                <X size={18} />
                            </button>

                            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Reconfigure Mission</h2>

                            <form onSubmit={handleUpdateProfile} className="space-y-5">
                                {[
                                    { label: 'Target Company', key: 'target_company', type: 'text', placeholder: 'e.g. Google, Stripe, OpenAI' },
                                    { label: 'Target Role', key: 'target_role', type: 'text', placeholder: 'e.g. Frontend Engineer' },
                                    { label: 'Prep Timeline (Weeks)', key: 'prep_duration', type: 'number', placeholder: '4' },
                                ].map((f) => (
                                    <div key={f.key} className="space-y-2">
                                        <label style={labelStyle}>{f.label}</label>
                                        <input
                                            type={f.type}
                                            placeholder={f.placeholder}
                                            value={(editForm as any)[f.key]}
                                            onChange={e => setEditForm({ ...editForm, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                                            className="w-full text-sm font-medium px-4 py-3 rounded-xl outline-none transition-all"
                                            style={{
                                                background: 'var(--background)',
                                                border: '1px solid var(--card-border)',
                                                color: 'var(--text-primary)',
                                            }}
                                            onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--accent-blue)'}
                                            onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--card-border)'}
                                        />
                                    </div>
                                ))}
                                <button type="submit"
                                    className="w-full py-3 rounded-xl text-sm font-bold text-white talvix-gradient transition-all active:scale-95 mt-2"
                                    style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
                                    Save Configuration
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
