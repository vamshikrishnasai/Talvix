"use client"

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    BarChart3,
    Trophy,
    Zap,
    CheckCircle2,
    AlertCircle,
    Download,
    Loader2,
    Target,
    TrendingUp,
    FileText,
    ArrowUpRight,
    Sparkles as SparklesIcon,
    Cpu,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function PerformancePage() {
    const [performance, setPerformance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const res = await api.get('/api/assessment/performance-summary');
                setPerformance(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPerformance();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
            <p className="text-text-muted font-black text-[10px] uppercase tracking-[0.4em]">Aggregating Performance Metrics...</p>
        </div>
    );

    const stats = performance?.stats || {};
    const summary = performance?.summary || {};

    return (
        <div className="max-w-[1100px] mx-auto space-y-12 pb-20 px-4 animate-fade-in text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight uppercase">Performance Analysis</h1>
                    <p className="text-sm font-medium text-text-secondary mt-1">Quantified growth tracking and mission readiness audit.</p>
                </div>
                <Button className="h-12 px-8 talvix-gradient text-white font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 gap-3 active:scale-95 transition-all text-xs">
                    <Download className="w-4 h-4" /> Export Intelligence
                </Button>
            </div>

            {/* Metric Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Readiness Index', value: `${summary.readiness_score || 0}%`, icon: Target, color: 'text-accent-blue', bg: 'bg-accent-blue/5' },
                    { label: 'Sync Sequences', value: stats.tests_taken || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                    { label: 'Average Precision', value: `${Math.round(stats.avg_test_score || 0)}%`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                    { label: 'Path Progression', value: `${Math.round(stats.roadmap_progress || 0)}%`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
                ].map((item, i) => (
                    <Card key={i} className="talvix-card p-8 flex items-center gap-6 border-none group">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${item.bg} ${item.color}`}>
                            <item.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-2">{item.label}</p>
                            <p className="text-2xl font-black text-text-primary tracking-tighter">{item.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* AI Review */}
                <Card className="lg:col-span-2 talvix-card p-10 space-y-10 border-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 text-accent-blue/5 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                        <Cpu className="w-48 h-48 rotate-12" />
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 talvix-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-primary tracking-tight uppercase">Strategic Growth Audit</h3>
                            <p className="text-[10px] font-black text-accent-blue uppercase tracking-widest mt-1">Neural Profile analysis output</p>
                        </div>
                    </div>

                    <div className="grid gap-10 relative z-10 pt-4">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Dominant Skill Clusters</h4>
                            <div className="flex flex-wrap gap-3">
                                {summary.strengths?.map((s: string, i: number) => (
                                    <span key={i} className="pill-tag bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/10 flex items-center gap-2 uppercase tracking-tight">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> {s}
                                    </span>
                                ))}
                                {(!summary.strengths || summary.strengths.length === 0) && <p className="text-xs text-text-muted font-bold italic p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl w-full">Pending further observation cycles...</p>}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Critical Focus Nodes</h4>
                            <div className="flex flex-wrap gap-3">
                                {summary.weaknesses?.map((w: string, i: number) => (
                                    <span key={i} className="pill-tag bg-amber-500/5 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/10 flex items-center gap-2 uppercase tracking-tight">
                                        <AlertCircle className="w-3.5 h-3.5" /> {w}
                                    </span>
                                ))}
                                {(!summary.weaknesses || summary.weaknesses.length === 0) && <p className="text-xs text-text-muted font-bold italic p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl w-full">All current parameters within optimal range.</p>}
                            </div>
                        </div>

                        <div className="p-8 talvix-gradient text-white rounded-[2rem] shadow-2xl shadow-blue-500/20 relative overflow-hidden group/tip">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover/tip:scale-125 transition-all">
                                <Zap className="w-24 h-24" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-3">Professional Insight Node</p>
                            <p className="text-base font-bold italic tracking-tight leading-relaxed">
                                "{summary.tip || 'Continue engagement with high-complexity simulations to refine decision-making protocols.'}"
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Training Stats */}
                <Card className="talvix-card p-10 space-y-12 border-none bg-white dark:bg-[#111113]">
                    <div className="flex items-center gap-4">
                        <BarChart3 className="w-6 h-6 text-accent-blue" />
                        <h3 className="text-lg font-bold text-text-primary tracking-tight uppercase">Operational Data</h3>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-12">
                        <div className="w-full p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] flex flex-col items-center justify-center space-y-3 shadow-inner">
                            <Zap className="w-8 h-8 text-amber-500 mb-2 animate-pulse" />
                            <p className="text-5xl font-black text-text-primary tracking-tighter leading-none">{stats.tests_taken || 0}</p>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Knowledge Syncs</p>
                        </div>

                        <div className="relative flex flex-col items-center">
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="96" cy="96" r="84" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-accent-blue/5" />
                                    <motion.circle
                                        initial={{ strokeDashoffset: 527 }}
                                        animate={{ strokeDashoffset: 527 - (527 * (stats.roadmap_progress || 0)) / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        cx="96" cy="96" r="84" fill="transparent" stroke="currentColor" strokeWidth="12"
                                        className="text-accent-blue"
                                        strokeDasharray={527}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-text-primary tracking-tighter leading-none">{Math.round(stats.roadmap_progress || 0)}%</span>
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2">Mission Path</span>
                                </div>
                            </div>
                            <div className="mt-8 text-center space-y-2">
                                <p className="text-xs text-text-secondary font-bold tracking-tight uppercase">Mastery Trajectory</p>
                                <p className="text-[9px] text-text-muted font-bold italic max-w-[200px] leading-relaxed mx-auto uppercase tracking-wide">
                                    Sync progress towards senior-level industry benchmarks.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
