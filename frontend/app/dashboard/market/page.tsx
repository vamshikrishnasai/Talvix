"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    TrendingUp, Globe, Zap, MapPin, Briefcase, DollarSign, Loader2,
    Filter, ChevronRight, Sparkles, Building2, Cpu, Brain, Target,
    BarChart2, PieChart as PieIcon, Activity, AlertTriangle, Wifi,
    Database, ChevronDown, ShieldAlert, BadgeAlert, TrendingDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

// ─── Color palettes ──────────────────────────────────────────────────────────
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
const GROWTH_COLORS: Record<string, string> = { Growth: '#10b981', Stable: '#3b82f6', Decline: '#ef4444' };

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 shadow-2xl">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-sm font-black" style={{ color: p.color || p.fill }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                </p>
            ))}
        </div>
    );
};

// ─── Custom Pie label ────────────────────────────────────────────────────────
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
            fontSize={10} fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ─── Section header ──────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, color = 'text-accent-blue' }:
    { icon: any; title: string; subtitle: string; color?: string }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-lg font-black text-text-primary uppercase tracking-tight">{title}</h2>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{subtitle}</p>
        </div>
    </div>
);

export default function MarketInsightsPage() {
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<any>(null);
    const [filters, setFilters] = useState<any>({ roles: [], locations: [], industries: [] });
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedLoc, setSelectedLoc] = useState('All');
    const [activeTab, setActiveTab] = useState<'glassdoor' | 'ai' | 'naukri' | 'ml' | 'live'>('live');

    const fetchFilters = useCallback(async () => {
        try {
            const res = await api.get('/api/market/filters');
            setFilters(res.data);
        } catch { }
    }, []);

    const fetchInsights = useCallback(async (role = selectedRole, loc = selectedLoc) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/market/insights?role=${role}&location=${loc}`);
            setInsights(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedRole, selectedLoc]);

    useEffect(() => {
        fetchFilters();
        fetchInsights('All', 'All');
    }, []);

    const handleApplyFilters = () => fetchInsights(selectedRole, selectedLoc);

    if (loading && !insights) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
                    <Brain className="w-5 h-5 text-emerald-500 absolute -bottom-1 -right-1" />
                </div>
                <div className="text-center">
                    <p className="text-text-muted font-black text-[10px] uppercase tracking-[0.4em]">Loading 3 Datasets...</p>
                    <p className="text-text-muted font-medium text-xs mt-1 opacity-60">Training ML models · Crunching predictions</p>
                </div>
            </div>
        );
    }

    const ai = insights?.ai_insights;
    const naukri = insights?.naukri_insights;
    const mlInfo = insights?.ml_info;

    const TABS = [
        { id: 'live', label: 'Live Situation', icon: Zap, color: 'text-amber-400' },
        { id: 'glassdoor', label: 'Glassdoor EDA', icon: BarChart2, color: 'text-accent-blue' },
        { id: 'ai', label: 'AI Job Market', icon: Brain, color: 'text-emerald-500' },
        { id: 'naukri', label: 'Naukri India', icon: Globe, color: 'text-amber-500' },
        { id: 'ml', label: 'ML Models', icon: Cpu, color: 'text-purple-500' },
    ] as const;

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4 text-foreground">

            {/* ── Header ── */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 pt-6">
                <div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase">Market Intel</h1>
                    <p className="text-text-secondary font-medium mt-1">
                        3-dataset ML analytics · Glassdoor · AI Job Market · Naukri
                    </p>
                </div>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 bg-card-bg p-3 rounded-[2rem] border border-card-border shadow-premium w-full xl:w-auto">
                    <div className="flex items-center gap-2 px-4 border-r border-card-border flex-1 xl:flex-none">
                        <Filter className="w-4 h-4 text-accent-blue shrink-0" />
                        <select
                            id="role-filter"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="bg-transparent text-text-primary border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer max-w-[140px]"
                        >
                            {filters.roles.map((r: string) => (
                                <option key={r} value={r} className="bg-background normal-case font-normal">{r}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 px-4 border-r border-card-border flex-1 xl:flex-none">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                        <select
                            id="location-filter"
                            value={selectedLoc}
                            onChange={(e) => setSelectedLoc(e.target.value)}
                            className="bg-transparent text-text-primary border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer max-w-[140px]"
                        >
                            {filters.locations.map((l: string) => (
                                <option key={l} value={l} className="bg-background normal-case font-normal">{l}</option>
                            ))}
                        </select>
                    </div>
                    <Button
                        id="apply-filters-btn"
                        onClick={handleApplyFilters}
                        disabled={loading}
                        className="talvix-gradient text-white h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 active:scale-95 transition-all gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Analyze
                    </Button>
                </div>
            </div>

            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Glassdoor Jobs', value: insights?.summary?.total_jobs?.toLocaleString() ?? '—', icon: Briefcase, color: 'text-accent-blue', bg: 'bg-blue-500/10' },
                    { label: 'Avg Salary (USD)', value: `$${Math.round(insights?.summary?.avg_salary ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'AI Market Avg ($)', value: `$${Math.round(ai?.avg_salary_usd ?? 0).toLocaleString()}`, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Naukri Listings', value: naukri?.total_listings?.toLocaleString() ?? '—', icon: Globe, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Card className="talvix-card p-6 flex items-center gap-5 border-none">
                            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center`}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{s.label}</p>
                                <p className="text-xl font-black text-text-primary tracking-tighter">{s.value}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ── Quick Insight Bar (AI dataset) ── */}
            {ai && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: '% Remote Friendly', value: `${ai.pct_remote}%`, icon: Wifi, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                        { label: 'High Automation Risk', value: `${ai.pct_high_automation}%`, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
                        { label: 'ML Salary Prediction', value: insights?.ml_salary_prediction ? `$${Math.round(insights.ml_salary_prediction).toLocaleString()}` : 'N/A', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    ].map((s, i) => (
                        <Card key={i} className="talvix-card p-5 flex items-center gap-4 border-none">
                            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{s.label}</p>
                                <p className="text-lg font-black text-text-primary">{s.value}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* ── Dataset Tabs ── */}
            <div className="flex gap-2 flex-wrap">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === tab.id
                            ? 'talvix-gradient text-white border-transparent shadow-lg shadow-blue-500/20'
                            : 'bg-card-bg border-card-border text-text-muted hover:text-text-primary'}`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                    {/* ════════════════════ TAB 0: LIVE SITUATION ════════════════════ */}
                    {activeTab === 'live' && insights?.live_market && (
                        <div className="space-y-10">
                            <SectionHeader icon={Zap} title="Live Market Intelligence" subtitle="Real-time sentiment · Recession Risk · High Demand Roles" color="text-amber-400" />
                            
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Sentiment & Volatility */}
                                <Card className="talvix-card p-8 border-none space-y-8 bg-gradient-to-br from-card-bg to-slate-900/10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Market Sentiment</h3>
                                        <BadgeAlert className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Current State</p>
                                            <p className="text-2xl font-black text-text-primary uppercase tracking-tighter">{insights.live_market.sentiment}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 text-center">
                                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Volatility</p>
                                                <p className="text-xl font-black text-text-primary">{insights.live_market.volatility}</p>
                                            </div>
                                            <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 text-center">
                                                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">Driver</p>
                                                <p className="text-xs font-black text-text-primary uppercase truncate">{insights.live_market.primary_driver}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Recession Risk Node */}
                                <Card className="lg:col-span-2 talvix-card p-0 border-none relative overflow-hidden bg-[#0d0d12]">
                                    <div className="absolute top-0 right-0 p-12 text-red-500/5 pointer-events-none">
                                        <ShieldAlert size={200} />
                                    </div>
                                    <div className="p-8 relative z-10 space-y-6 h-full flex flex-col justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                                                <TrendingDown size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Recession Impact Analysis</h3>
                                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-0.5">ML Data-Driven Risk Projection</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Resilience Score</span>
                                                    <div className="flex-1 h-px bg-white/10" />
                                                </div>
                                                <div className="flex items-end gap-3">
                                                    <span className="text-5xl font-black text-white">{insights.live_market.recession_analysis.recession_resilience_score}</span>
                                                    <span className="text-sm font-black text-emerald-400 mb-2">/100</span>
                                                </div>
                                                <p className="text-xs text-white/60 leading-relaxed font-medium">
                                                    {insights.live_market.situational_alert}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Safe Havens (Roles)</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {insights.live_market.recession_analysis.safe_roles.map((r: string, i: number) => (
                                                            <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20">{r}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">High Risk Sectors</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {insights.live_market.recession_analysis.at_risk_industries.map((r: string, i: number) => (
                                                            <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-black uppercase rounded-lg border border-red-500/20">{r}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* High Demand Roles Grid */}
                            <Card className="talvix-card p-8 border-none space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-500">
                                        <Target size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Top High-Demand Technical Roles</h3>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Aggregated from 3 major datasets</p>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {insights.live_market.high_demand_roles.map((role: string, i: number) => (
                                        <div key={i} className="group relative p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-card-border hover:border-amber-400/50 transition-all duration-300">
                                            <div className="absolute top-4 right-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Zap className="w-4 h-4 fill-amber-500" />
                                            </div>
                                            <div className="text-xs font-black text-text-muted mb-2 opacity-50">#0{i + 1}</div>
                                            <div className="text-sm font-black text-text-primary leading-tight uppercase tracking-tight">{role}</div>
                                            <div className="mt-4 pt-4 border-t border-card-border">
                                                <button className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                                    Analyze Path <ChevronRight size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ════════════════════ TAB 1: GLASSDOOR EDA ════════════════════ */}
                    {activeTab === 'glassdoor' && (
                        <div className="space-y-10">
                            <SectionHeader icon={BarChart2} title="Glassdoor EDA Dataset" subtitle="US Job Market · Salary · Skills · Companies" />

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Skills bar */}
                                <Card className="lg:col-span-2 talvix-card p-8 border-none space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-black text-text-primary uppercase tracking-tight">Top In-Demand Skills</h3>
                                            <p className="text-[10px] text-accent-blue uppercase tracking-widest font-bold mt-1">From job mentions</p>
                                        </div>
                                        <Zap className="w-5 h-5 text-accent-blue" />
                                    </div>
                                    <div className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={insights?.top_skills}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" vertical={false} opacity={0.1} />
                                                <XAxis dataKey="skill" stroke="#888" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <defs>
                                                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#3b82f6" />
                                                        <stop offset="100%" stopColor="#2563eb" />
                                                    </linearGradient>
                                                </defs>
                                                <Bar dataKey="count" fill="url(#blueGrad)" radius={[8, 8, 0, 0]} barSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* Salary Histogram */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Salary Distribution</h3>
                                        <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mt-1">Histogram · USD</p>
                                    </div>
                                    <div className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={insights?.salary_histogram}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" vertical={false} opacity={0.1} />
                                                <XAxis dataKey="range" stroke="#888" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Salary by Role */}
                                <Card className="lg:col-span-2 talvix-card p-8 border-none space-y-6">
                                    <h3 className="font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-emerald-500" /> Avg Salary by Role
                                    </h3>
                                    <div className="h-[360px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={insights?.salary_chart} layout="vertical" margin={{ left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" horizontal={false} opacity={0.1} />
                                                <XAxis type="number" stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                                                <YAxis dataKey="role" type="category" stroke="#888" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} width={130} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="salary" fill="#10b981" radius={[0, 8, 8, 0]} barSize={28} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* ML Demand Forecast */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Demand Forecast</h3>
                                        <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mt-1">Linear Regression · 4 quarters</p>
                                    </div>
                                    <div className="h-[360px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={insights?.prediction_trend}>
                                                <defs>
                                                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" vertical={false} opacity={0.1} />
                                                <XAxis dataKey="quarter" stroke="#888" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="predicted_demand" stroke="#10b981" fill="url(#forecastGrad)" strokeWidth={3} dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>

                            {/* Top Companies */}
                            {insights?.top_companies?.length > 0 && (
                                <Card className="talvix-card p-8 border-none">
                                    <h3 className="font-black text-text-primary uppercase tracking-tight flex items-center gap-2 mb-6">
                                        <Building2 className="w-5 h-5 text-accent-blue" /> Top Hiring Companies
                                    </h3>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                        {insights.top_companies.map((c: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-card-border hover:border-accent-blue/30 transition-all">
                                                <div className="w-9 h-9 bg-accent-blue text-white rounded-xl flex items-center justify-center font-black text-xs">
                                                    {c.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-text-secondary leading-tight">{c}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* ════════════════════ TAB 2: AI JOB MARKET ════════════════════ */}
                    {activeTab === 'ai' && ai && (
                        <div className="space-y-10">
                            <SectionHeader icon={Brain} title="AI Job Market Insights" subtitle="Global AI/Tech Market · Automation · Remote · Growth Prediction" color="text-emerald-500" />

                            {/* 4 Pie charts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {[
                                    { title: 'Industry Distribution', data: ai.industry_pie, sub: 'Top 8 industries' },
                                    { title: 'Automation Risk', data: ai.automation_pie, sub: 'High / Medium / Low', colorMap: { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' } },
                                    { title: 'Remote Friendly', data: ai.remote_pie, sub: 'Yes / No', colorMap: { Yes: '#10b981', No: '#ef4444' } },
                                    { title: 'AI Adoption Level', data: ai.ai_adoption_pie, sub: 'High / Medium / Low', colorMap: { High: '#8b5cf6', Medium: '#3b82f6', Low: '#94a3b8' } },
                                ].map((chart, idx) => (
                                    <Card key={idx} className="talvix-card p-6 border-none space-y-4">
                                        <div>
                                            <h3 className="font-black text-text-primary text-sm uppercase tracking-tight">{chart.title}</h3>
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{chart.sub}</p>
                                        </div>
                                        <div className="h-[220px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={chart.data}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%" cy="50%"
                                                        outerRadius={80}
                                                        labelLine={false}
                                                        label={renderCustomLabel}
                                                    >
                                                        {chart.data?.map((entry: any, i: number) => (
                                                            <Cell key={i} fill={(chart.colorMap as any)?.[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend formatter={(v) => <span className="text-[9px] font-bold text-text-muted uppercase">{v}</span>} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Job Growth Pie */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Job Growth Distribution</h3>
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Growth / Stable / Decline</p>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={ai.growth_pie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                                    outerRadius={110} innerRadius={55} labelLine={false} label={renderCustomLabel}>
                                                    {ai.growth_pie?.map((e: any, i: number) => (
                                                        <Cell key={i} fill={GROWTH_COLORS[e.name] || PIE_COLORS[i]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend formatter={(v) => <span className="text-[9px] font-bold uppercase">{v}</span>} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* Salary by Title (AI dataset) */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Avg Salary by Title</h3>
                                        <p className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mt-1">AI dataset · USD/yr</p>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ai.ai_salary_chart} layout="vertical" margin={{ left: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" horizontal={false} opacity={0.1} />
                                                <XAxis type="number" stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                                                <YAxis dataKey="role" type="category" stroke="#888" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} width={120} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="salary" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={24} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* AI Salary Histogram */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">AI Salary Distribution</h3>
                                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-1">Histogram · AI dataset</p>
                                    </div>
                                    <div className="h-[260px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ai.ai_salary_histogram}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" vertical={false} opacity={0.1} />
                                                <XAxis dataKey="range" stroke="#888" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={36} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* Location bar */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Top Job Locations</h3>
                                        <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mt-1">AI dataset · Global cities</p>
                                    </div>
                                    <div className="h-[260px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ai.location_bar}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" vertical={false} opacity={0.1} />
                                                <XAxis dataKey="location" stroke="#888" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={28} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>

                            {/* Growth predictions table */}
                            {ai.growth_predictions?.length > 0 && (
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                                            <Target className="w-5 h-5 text-emerald-500" />
                                            Gradient Boost Growth Predictions
                                        </h3>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
                                            ML: Gradient Boosting Classifier · Predicts Growth / Stable / Decline per role
                                        </p>
                                    </div>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {ai.growth_predictions.slice(0, 12).map((p: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-card-border">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-text-primary truncate">{p.title}</p>
                                                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{p.industry}</p>
                                                </div>
                                                <span className={`shrink-0 ml-2 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${p.predicted_growth === 'Growth' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : p.predicted_growth === 'Decline' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {p.predicted_growth}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* ════════════════════ TAB 3: NAUKRI ════════════════════ */}
                    {activeTab === 'naukri' && naukri && (
                        <div className="space-y-10">
                            <SectionHeader icon={Globe} title="Naukri India Dataset" subtitle="India's Largest Job Portal · Skills · Industries · Cities" color="text-amber-500" />

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Top Industries bar */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Top Industries Hiring</h3>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Naukri · India market</p>
                                    </div>
                                    <div className="h-[320px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={naukri.industry_bar} layout="vertical" margin={{ left: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" horizontal={false} opacity={0.1} />
                                                <XAxis type="number" stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                                                <YAxis dataKey="industry" type="category" stroke="#888" fontSize={8} fontWeight="bold" tickLine={false} axisLine={false} width={140} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" fill="#f59e0b" radius={[0, 8, 8, 0]} barSize={22} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* Top Skills (Naukri) */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Most-Listed Skills</h3>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Extracted from job descriptions</p>
                                    </div>
                                    <div className="h-[320px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={naukri.top_skills}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" vertical={false} opacity={0.1} />
                                                <XAxis dataKey="skill" stroke="#888" fontSize={8} fontWeight="bold" tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={50} />
                                                <YAxis stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} barSize={32} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Experience Histogram */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Experience Distribution</h3>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Years · Histogram</p>
                                    </div>
                                    <div className="h-[260px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={naukri.exp_histogram}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" vertical={false} opacity={0.1} />
                                                <XAxis dataKey="range" stroke="#888" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" fill="#fb923c" radius={[6, 6, 0, 0]} barSize={42} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* Top Locations */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Top Cities</h3>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Naukri · Job density</p>
                                    </div>
                                    <div className="h-[260px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={naukri.location_bar} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" horizontal={false} opacity={0.1} />
                                                <XAxis type="number" stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                                                <YAxis dataKey="city" type="category" stroke="#888" fontSize={8} tickLine={false} axisLine={false} width={80} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" fill="#eab308" radius={[0, 6, 6, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* Top Job Titles Pie */}
                                <Card className="talvix-card p-8 border-none space-y-6">
                                    <div>
                                        <h3 className="font-black text-text-primary uppercase tracking-tight">Top Job Titles</h3>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Pie distribution</p>
                                    </div>
                                    <div className="h-[260px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={naukri.title_bar?.slice(0, 6)} dataKey="count" nameKey="title"
                                                    cx="50%" cy="50%" outerRadius={90} labelLine={false} label={renderCustomLabel}>
                                                    {naukri.title_bar?.slice(0, 6).map((_: any, i: number) => (
                                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend formatter={(v) => <span className="text-[8px] font-bold uppercase text-text-muted">{v}</span>} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════ TAB 4: ML MODELS ════════════════════ */}
                    {activeTab === 'ml' && (
                        <div className="space-y-10">
                            <SectionHeader icon={Cpu} title="ML Models Used" subtitle="Algorithms · Datasets · Performance Metrics" color="text-purple-500" />

                            <div className="grid md:grid-cols-2 gap-6">
                                {mlInfo?.algorithms?.map((algo: any, i: number) => {
                                    const colors = ['text-accent-blue bg-blue-500/10', 'text-emerald-500 bg-emerald-500/10', 'text-amber-500 bg-amber-500/10', 'text-purple-500 bg-purple-500/10'];
                                    const icons = [Target, TrendingUp, Sparkles, Activity];
                                    const Icon = icons[i];
                                    return (
                                        <Card key={i} className="talvix-card p-8 border-none space-y-5">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[i].split(' ')[1]}`}>
                                                    <Icon className={`w-6 h-6 ${colors[i].split(' ')[0]}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-text-primary tracking-tight">{algo.name}</h3>
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Dataset: {algo.dataset}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-text-secondary font-medium leading-relaxed">{algo.purpose}</p>
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Performance</span>
                                                <span className={`text-sm font-black ${colors[i].split(' ')[0]}`}>{algo.metric}</span>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* AI Strategy Insight */}
                            <Card className="p-8 talvix-gradient text-white border-none rounded-[2.5rem] shadow-3xl shadow-blue-500/30 relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                <div className="relative space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Cpu className="w-5 h-5 text-blue-200" />
                                        <span className="text-[10px] font-black uppercase text-blue-200 tracking-[0.3em]">AI Strategy Node</span>
                                    </div>
                                    <p className="text-sm font-bold text-blue-50 leading-relaxed">
                                        {selectedRole !== 'All'
                                            ? `Neural projection: Demand for ${selectedRole} in ${selectedLoc === 'All' ? 'global' : selectedLoc} markets is accelerating. Random Forest model predicts salary at $${insights?.ml_salary_prediction ? Math.round(insights.ml_salary_prediction).toLocaleString() : 'N/A'}. Gradient Boosting growth classifier indicates strong forward momentum.`
                                            : `Multi-dataset cluster analysis across Glassdoor EDA, AI Job Market, and Naukri reveals high-density hiring in AI/ML, cybersecurity, and cloud engineering. K-Means skill clustering identifies Python + AWS as the dominant skill cluster globally.`}
                                    </p>
                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Models: Random Forest · Gradient Boosting · K-Means · Linear Regression</span>
                                        <Sparkles className="w-4 h-4 opacity-40" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
