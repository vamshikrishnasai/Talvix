"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Trophy, Clock, CheckCircle2, ChevronRight, HelpCircle as HelpIcon,
    Zap, Timer, ArrowRight, ShieldCheck,
    Trash2, Loader2, Sparkles, AlertCircle, ChevronLeft, X, BookOpen,
    Users, Volume2, Globe, Target, UserCheck, Smile, History, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const ICONS: Record<string, any> = {
    users: Users,
    volume2: Volume2,
    globe: Globe,
    target: Target,
    'user-check': UserCheck,
    smile: Smile,
    history: History,
    cpu: Cpu
};

export default function TestsPage() {
    const [testState, setTestState] = useState<'IDLE' | 'LOADING' | 'TAKING' | 'SUBMITTED'>('IDLE');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(1200);
    const [results, setResults] = useState<any>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [labs, setLabs] = useState<any[]>([]);
    const [loadingLabs, setLoadingLabs] = useState(true);
    const [currentDomain, setCurrentDomain] = useState<string | null>(null);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        fetchLabs();
    }, []);

    const fetchLabs = async () => {
        setLoadingLabs(true);
        try {
            const res = await api.get('/api/assessment/laboratories');
            setLabs(res.data);
        } catch (err) { } finally { setLoadingLabs(false); }
    };

    useEffect(() => {
        if (testState === 'TAKING' && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && testState === 'TAKING') {
            handleFinalSubmit();
        }
        return () => clearInterval(timerRef.current);
    }, [testState, timeLeft]);

    const startTest = async (domain?: string) => {
        setTestState('LOADING');
        setCurrentDomain(domain || "General Tech");
        try {
            const endpoint = domain ? `/api/assessment/domain/${domain}` : '/api/assessment/resume-skill-test';
            const res = await api.get(endpoint);
            setQuestions(res.data || []);
            setTestState('TAKING');
            setTimeLeft(900);
            setCurrentIndex(0);
            setAnswers({});
        } catch (err: any) {
            setTestState('IDLE');
        }
    };

    const handleFinalSubmit = async () => {
        let correct = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === (q.correct_answer_index ?? q.correct_index)) correct++;
        });

        const score = Math.round((correct / questions.length) * 100);
        setResults({ score, correct, total: questions.length });
        setTestState('SUBMITTED');
        setShowConfirm(false);

        try {
            await api.post('/api/assessment/test/submit', {
                skill_name: currentDomain || "Technical Assessment",
                score: score
            });
            fetchLabs();
        } catch (err) { }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (testState === 'LOADING') return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
            <p className="text-text-muted font-black text-[10px] uppercase tracking-[0.3em]">Initializing Assessment Core...</p>
        </div>
    );

    if (testState === 'TAKING') {
        const q = questions[currentIndex];
        return (
            <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-4 lg:p-8 animate-fade-in group/lab">
                <div className="max-w-[1000px] w-full bg-card-bg border border-card-border rounded-[3rem] shadow-premium overflow-hidden flex flex-col h-[90vh] relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
                        <motion.div
                            className="h-full talvix-gradient shadow-2xl"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    <header className="p-8 border-b border-card-border flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 talvix-gradient rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">Simulation Lab</h2>
                                <p className="text-[10px] font-black text-accent-blue uppercase tracking-[0.2em] mt-0.5">Neural Protocol Engage</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border font-black ${timeLeft < 300 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-accent-blue/5 text-accent-blue border-accent-blue/10'}`}>
                            <Timer className="w-5 h-5" />
                            <span className="text-2xl tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-12 lg:p-16 scrollbar-hide">
                        <div className="max-w-2xl mx-auto space-y-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="px-4 py-1.5 bg-text-primary text-background text-[10px] font-black uppercase tracking-widest rounded-xl">Node {(currentIndex + 1).toString().padStart(2, '0')}</span>
                                    <div className="h-0.5 w-8 bg-card-border" />
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{questions.length - currentIndex - 1} Sequences Remaining</span>
                                </div>
                                <h3 className="text-3xl font-black text-text-primary leading-tight tracking-tight">
                                    {q.question}
                                </h3>
                            </div>

                            <div className="grid gap-4">
                                {q.options?.map((option: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setAnswers({ ...answers, [currentIndex]: i })}
                                        className={`w-full p-6 text-left rounded-[1.8rem] border-2 transition-all flex items-center justify-between gap-6 group relative overflow-hidden ${answers[currentIndex] === i
                                            ? 'border-accent-blue bg-accent-blue/5 text-text-primary'
                                            : 'border-transparent bg-slate-100 dark:bg-slate-800/40 text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <span className="font-bold text-sm relative z-10">{option}</span>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 relative z-10 ${answers[currentIndex] === i ? 'bg-accent-blue text-white' : 'bg-background text-text-muted shadow-sm'}`}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <footer className="p-10 border-t border-card-border bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                        <Button
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(currentIndex - 1)}
                            variant="ghost"
                            className="text-text-muted hover:text-text-primary font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" /> Re-Scan
                        </Button>
                        <Button
                            onClick={() => currentIndex < questions.length - 1 ? setCurrentIndex(currentIndex + 1) : setShowConfirm(true)}
                            className="h-16 px-12 talvix-gradient text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 active:scale-95 transition-all"
                        >
                            {currentIndex < questions.length - 1 ? 'Next Sequence' : 'Finalize Sync'} <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </footer>
                </div>

                <AnimatePresence>
                    {showConfirm && (
                        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card-bg border border-card-border rounded-[3rem] p-12 max-w-sm w-full shadow-3xl text-center space-y-8">
                                <div className="w-20 h-20 bg-accent-blue/10 text-accent-blue rounded-[1.8rem] flex items-center justify-center mx-auto"><AlertCircle className="w-10 h-10" /></div>
                                <div>
                                    <h3 className="text-2xl font-black text-text-primary tracking-tighter uppercase">Commit Output?</h3>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-3">Final synchronization will be recorded</p>
                                </div>
                                <div className="flex flex-col gap-4 pt-4">
                                    <Button onClick={handleFinalSubmit} className="h-16 talvix-gradient text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em]">Initiate Commit</Button>
                                    <Button onClick={() => setShowConfirm(false)} variant="ghost" className="text-text-muted font-black text-[10px] uppercase">Abort / Review</Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    if (testState === 'SUBMITTED') {
        return (
            <div className="max-w-[800px] mx-auto py-24 px-4 text-center space-y-12 animate-fade-in flex flex-col justify-center min-h-[80vh]">
                <div className="relative mx-auto">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-40 h-40 talvix-gradient rounded-[3rem] flex items-center justify-center text-white shadow-3xl shadow-blue-500/40">
                        <Trophy className="w-16 h-16" />
                    </motion.div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500 text-white rounded-full border-4 border-background flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-accent-blue uppercase tracking-[0.5em]">Synchronized Assessment Verified</p>
                    <h2 className="text-7xl font-black text-text-primary tracking-tighter">{results.score}%</h2>
                    <p className="text-text-secondary font-bold text-sm tracking-wide uppercase">Core Accuracy: {results.correct} Point Logic Clusters / {results.total}</p>
                </div>
                <div className="flex gap-4 justify-center pt-8">
                    <Button onClick={() => setTestState('IDLE')} className="h-16 px-12 talvix-gradient text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl">Return to Hub</Button>
                    <Button onClick={() => window.location.href = '/dashboard/performance'} variant="outline" className="h-16 px-12 border-card-border text-text-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.3em]">View Analytics</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1100px] mx-auto space-y-12 pb-32 px-4 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase">Intelligence Laboratories</h1>
                    <p className="text-text-secondary font-medium">Verified skill validation through neural simulation.</p>
                </div>
                <Card className="p-6 talvix-card flex items-center gap-6 border-none">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Active Labs</p>
                        <p className="text-2xl font-black text-text-primary">{labs.length}</p>
                    </div>
                    <div className="w-px h-10 bg-card-border" />
                    <div className="w-12 h-12 talvix-gradient rounded-xl flex items-center justify-center text-white shadow-lg"><Zap className="w-5 h-5" /></div>
                </Card>
            </header>

            {loadingLabs ? (
                <div className="py-40 flex flex-col items-center gap-6">
                    <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Synchronizing Lab Grid Core...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {labs.map((lab, i) => {
                        const IconComp = ICONS[lab.icon] || BookOpen;
                        return (
                            <motion.div key={lab.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                <Card className="talvix-card group p-10 space-y-10 flex flex-col h-full border-none relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-10 text-accent-blue/5 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                                        <IconComp className="w-40 h-40 rotate-12" />
                                    </div>
                                    <div className="relative z-10 flex flex-col flex-1 gap-8">
                                        <div className="flex justify-between items-start">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-text-primary group-hover:bg-accent-blue group-hover:text-white transition-all shadow-inner">
                                                <IconComp className="w-7 h-7" />
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${lab.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'}`}>
                                                {lab.status}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-black text-text-primary tracking-tight leading-tight">{lab.title}</h3>
                                            <p className="text-xs text-text-secondary font-bold leading-relaxed line-clamp-3">{lab.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-6 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Complexity</span>
                                                <span className="text-xs font-black text-text-primary">{lab.questions_count} NODES</span>
                                            </div>
                                            <div className="w-px h-8 bg-card-border" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Limit</span>
                                                <span className="text-xs font-black text-text-primary">15 MIN</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={() => startTest(lab.domain)} className="w-full mt-4 h-16 bg-slate-100 dark:bg-slate-800 text-text-primary hover:bg-accent-blue hover:text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all border-none shadow-premium active:scale-95 group-hover:scale-[1.02]">
                                        Initialize Protocol <ArrowRight className="ml-3 w-4 h-4" />
                                    </Button>
                                </Card>
                            </motion.div>
                        );
                    })}

                    <Card className="talvix-card p-10 flex flex-col items-center justify-center text-center gap-6 border-dashed border-2 bg-transparent opacity-40">
                        <div className="w-16 h-16 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center">
                            <Clock className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Next cycle: Scalability & Architecture Labs</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
