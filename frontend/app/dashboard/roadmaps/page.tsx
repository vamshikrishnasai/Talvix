"use client"

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    CheckCircle2,
    Clock,
    ChevronDown,
    BookOpen,
    Brain,
    Loader2,
    ExternalLink,
    Trophy,
    ArrowRight,
    Zap,
    Target,
    Flag,
    RefreshCw,
    Video,
    FileText,
    Globe,
    X,
    Check,
    Cpu,
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function RoadmapsPage() {
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [generating, setGenerating] = useState(false);
    const [quiz, setQuiz] = useState<any>(null);
    const [quizModuleId, setQuizModuleId] = useState<number | null>(null);
    const [submittingTest, setSubmittingTest] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

    useEffect(() => {
        fetchRoadmap();
    }, []);

    const fetchRoadmap = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/roadmap/current');
            if (Array.isArray(response.data)) {
                setModules(response.data);
                if (response.data.length > 0 && expanded === null) setExpanded(response.data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch roadmap", error);
        } finally {
            setLoading(false);
        }
    };

    const generateRoadmap = async () => {
        try {
            setGenerating(true);
            await api.post('/api/roadmap/generate');
            await fetchRoadmap();
        } catch (error) {
            alert("Failed to synthesize roadmap.");
        } finally {
            setGenerating(false);
        }
    };

    const startModuleTest = async (modId: number) => {
        try {
            const response = await api.post(`/api/roadmap/complete-module/${modId}`);
            setQuiz(response.data.quiz);
            setQuizModuleId(modId);
            setQuizAnswers(new Array(response.data.quiz.length).fill(-1));
        } catch (error) {
            alert("Failed to generate AI quiz.");
        }
    };

    const handleAnswerSelect = (qIdx: number, aIdx: number) => {
        const newAns = [...quizAnswers];
        newAns[qIdx] = aIdx;
        setQuizAnswers(newAns);
    };

    const submitQuiz = async () => {
        if (!quizModuleId || quizAnswers.includes(-1)) return;
        setSubmittingTest(true);
        try {
            const correctCount = quizAnswers.filter((ans, idx) => ans === quiz[idx].correct_index).length;
            const score = (correctCount / quiz.length) * 100;
            await api.post(`/api/roadmap/verify-test/${quizModuleId}?score=${score}`);
            setQuiz(null);
            fetchRoadmap();
        } finally {
            setSubmittingTest(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
            <p className="text-text-muted font-bold text-[10px] uppercase tracking-[0.4em]">Synthesizing Execution Path...</p>
        </div>
    );

    return (
        <div className="max-w-[1240px] mx-auto space-y-10 pb-20 animate-fade-in text-foreground">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary uppercase">Mission Roadmap</h1>
                    <p className="text-sm font-medium text-text-secondary mt-1">Intelligence-backed progression architecture for your career sprint.</p>
                </div>
                <Button
                    onClick={generateRoadmap}
                    disabled={generating}
                    className="h-12 px-8 talvix-gradient text-white font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 gap-3 active:scale-95 transition-all text-xs"
                >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Remap Roadmap
                </Button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Main List */}
                <div className="lg:col-span-8 space-y-6">
                    {modules.map((item, index) => (
                        <Card key={item.id} className="talvix-card overflow-hidden transition-all group border-none bg-white dark:bg-[#111113]">
                            <div
                                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                                className={`p-8 cursor-pointer transition-all flex items-center justify-between ${expanded === item.id ? 'bg-accent-blue/[0.03]' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-50 dark:bg-slate-900 text-text-muted border border-card-border shadow-sm'}`}>
                                        {item.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : (index + 1)}
                                    </div>
                                    <div>
                                        <h3 className={`text-base font-bold tracking-tight ${item.status === 'completed' ? 'text-emerald-500/60 line-through' : 'text-text-primary'}`}>
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${item.status === 'completed' ? 'text-emerald-500' : 'text-accent-blue'}`}>
                                                {item.status === 'completed' ? 'Node Synchronized' : 'Active Module'}
                                            </span>
                                            {item.resource_links?.length > 0 && (
                                                <>
                                                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                                        <FileText className="w-3 h-3" /> {item.resource_links.length} Sources
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-900 transition-transform duration-500 ${expanded === item.id ? 'rotate-180' : ''}`}>
                                    <ChevronDown className="w-4 h-4 text-text-muted" />
                                </div>
                            </div>

                            <AnimatePresence>
                                {expanded === item.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-white dark:bg-[#111113]"
                                    >
                                        <div className="p-8 pt-2 space-y-8 border-t border-card-border/50">
                                            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-card-border/50">
                                                <p className="text-sm font-medium text-text-secondary leading-relaxed">{item.description}</p>
                                            </div>

                                            {item.resource_links?.length > 0 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Curation Intelligence</h4>
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        {item.resource_links?.map((link: any, li: number) => (
                                                            <a
                                                                key={li}
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-5 bg-slate-50 dark:bg-slate-900 border border-card-border rounded-xl flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-black hover:shadow-lg hover:shadow-blue-500/5 hover:border-accent-blue/30"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-lg bg-accent-blue/5 text-accent-blue flex items-center justify-center group-hover:bg-accent-blue group-hover:text-white transition-all">
                                                                        {link.type?.toLowerCase().includes('video') ? <Video className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                                                                    </div>
                                                                    <p className="text-xs font-bold text-text-primary tracking-tight truncate max-w-[150px]">{link.title}</p>
                                                                </div>
                                                                <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-blue transition-all" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-4">
                                                {item.status !== 'completed' ? (
                                                    <Button
                                                        onClick={() => startModuleTest(item.id)}
                                                        className="w-full h-14 talvix-gradient text-white font-bold uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-blue-500/20 gap-3 group/btn text-xs"
                                                    >
                                                        Run Knowledge Check <Cpu className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                                    </Button>
                                                ) : (
                                                    <div className="p-5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-center gap-3">
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                        <span className="font-bold text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Node Sync Complete</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    ))}
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-8 space-y-6 bg-white dark:bg-[#111113] border-none shadow-premium relative overflow-hidden group">
                        <div className="talvix-gradient absolute inset-0 opacity-[0.03]" />
                        <div className="relative space-y-6">
                            <div className="flex items-center gap-3">
                                <Target className="w-5 h-5 text-accent-blue" />
                                <h3 className="text-xs font-bold text-text-primary uppercase tracking-[0.2em]">Mission Stats</h3>
                            </div>
                            <div className="grid gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center border border-card-border">
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Nodes Total</span>
                                    <span className="text-sm font-bold text-text-primary">{modules.length}</span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center border border-card-border">
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Synchronized</span>
                                    <span className="text-sm font-bold text-emerald-500">{modules.filter(m => m.status === 'completed').length}</span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center border border-card-border">
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Sprint</span>
                                    <span className="text-sm font-bold text-accent-blue font-outfit">Phase 01</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 talvix-gradient text-white border-none rounded-[2rem] shadow-2xl shadow-blue-500/20 relative overflow-hidden">
                        <Cpu className="w-12 h-12 text-white/20 mb-6" />
                        <h4 className="font-bold text-lg tracking-tight mb-2 uppercase">Neural Pathing</h4>
                        <p className="text-xs text-white/70 font-medium leading-relaxed">
                            Each module is dynamically generated based on your profile gaps and market trends for your target company.
                        </p>
                    </Card>
                </div>
            </div>

            {/* Quiz Modal */}
            <AnimatePresence>
                {quiz && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card-bg rounded-[2.5rem] p-12 max-w-2xl w-full shadow-3xl border border-card-border relative text-text-primary">
                            <button onClick={() => setQuiz(null)} className="absolute top-8 right-8 p-2 text-text-muted hover:text-text-primary transition-all">
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-14 h-14 talvix-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <Brain className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight uppercase">Knowledge Verification</h2>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Authenticating module synchronization...</p>
                                </div>
                            </div>

                            <div className="space-y-10 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
                                {quiz.map((q: any, i: number) => (
                                    <div key={i} className="space-y-6">
                                        <div className="flex gap-4">
                                            <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 text-text-primary text-[10px] font-bold flex items-center justify-center shrink-0 border border-card-border">{i + 1}</span>
                                            <p className="text-base font-bold text-text-primary tracking-tight leading-tight">{q.question}</p>
                                        </div>
                                        <div className="grid gap-3 pl-12">
                                            {q.options.map((opt: string, oi: number) => (
                                                <button
                                                    key={oi}
                                                    onClick={() => handleAnswerSelect(i, oi)}
                                                    className={`p-4 rounded-xl text-left text-sm font-bold border-2 transition-all flex items-center justify-between group ${quizAnswers[i] === oi
                                                        ? 'border-accent-blue bg-accent-blue/5 text-accent-blue'
                                                        : 'border-card-border bg-slate-50 dark:bg-slate-900/50 text-text-secondary hover:border-accent-blue/30'
                                                        }`}
                                                >
                                                    <span className="flex-1">{opt}</span>
                                                    {quizAnswers[i] === oi && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 flex gap-4">
                                <Button onClick={() => setQuiz(null)} variant="outline" className="flex-1 h-14 rounded-xl border-card-border text-text-muted font-bold uppercase tracking-widest text-xs">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submitQuiz}
                                    disabled={submittingTest || quizAnswers.includes(-1)}
                                    className="flex-1 h-14 talvix-gradient rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-blue-500/10 text-white text-xs"
                                >
                                    {submittingTest ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : "Verify Sync"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
