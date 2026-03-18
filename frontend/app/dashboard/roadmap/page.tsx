"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    CheckCircle2,
    Clock,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Brain,
    Loader2,
    ExternalLink,
    Trophy,
    ArrowRight,
    Zap,
    Target,
    MapPin,
    Flag,
    Sparkles,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function RoadmapPage() {
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
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
            } else {
                setModules([]);
            }
        } catch (error: any) {
            console.error("Failed to fetch roadmap", error);
        } finally {
            setLoading(false);
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
        if (!quizModuleId || quizAnswers.includes(-1)) {
            alert("Please answer all questions.");
            return;
        }

        setSubmittingTest(true);
        try {
            const correctCount = quizAnswers.filter((ans, idx) => ans === quiz[idx].correct_index).length;
            const score = (correctCount / quiz.length) * 100;

            await api.post(`/api/roadmap/verify-test/${quizModuleId}?score=${score}`);

            if (score >= 70) {
                alert(`Passed! Score: ${Math.round(score)}%`);
                setQuiz(null);
                fetchRoadmap();
            } else {
                alert(`Score: ${Math.round(score)}%. You need 70% to complete. Try again after revision!`);
                setQuiz(null);
            }
        } finally {
            setSubmittingTest(false);
        }
    };

    const getResourceLink = (resource: string, topic: string) => {
        const query = encodeURIComponent(`${topic} tutorial on ${resource}`);
        return `https://www.google.com/search?q=${query}`;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="relative">
                <div className="w-24 h-24 border-8 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin" />
                <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-brand-blue" />
            </div>
            <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] animate-pulse">Mapping Your Mission...</p>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-24 px-4 sm:px-6 animate-slide-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                        <Flag className="w-3 h-3" /> Career Topography
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black font-outfit text-slate-900 leading-tight tracking-tight">Mastery <span className="text-brand-blue">Blueprints</span></h1>
                    <p className="text-slate-500 font-medium text-xl max-w-2xl leading-relaxed">Your AI-generated journey into specialized industry competencies.</p>
                </div>

                <Card className="p-8 bg-white rounded-[3rem] shadow-2xl border-none flex items-center gap-6 min-w-[300px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 opacity-50 rounded-bl-[3rem] group-hover:scale-110 transition-transform" />
                    <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg relative z-10 group-hover:bg-brand-blue group-hover:text-white transition-colors duration-500">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Rank Progression</p>
                        <p className="text-4xl font-black text-slate-900 font-outfit leading-none mb-1">{modules?.filter(m => m.status === 'completed').length || 0}<span className="text-xl text-slate-300">/{modules?.length || 0}</span></p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Modules Mastered</p>
                    </div>
                </Card>
            </header>

            <div className="grid lg:grid-cols-12 gap-12 relative">
                {/* Visual Connector Line */}
                <div className="hidden lg:block absolute left-[30px] top-20 bottom-0 w-1.5 bg-slate-200/50 rounded-full z-0" />

                <div className="lg:col-span-8 space-y-8 relative z-10">
                    {modules?.map((item, index) => (
                        <div key={item.id} className="flex gap-8 group">
                            <motion.div
                                initial={false}
                                animate={{ scale: expanded === item.id ? 1.1 : 1 }}
                                className={`
                                    w-16 h-16 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl transition-all duration-500 relative z-20 overflow-hidden
                                    ${item.status === 'completed' ? 'bg-brand-blue text-white ring-8 ring-blue-50' : 'bg-white text-slate-400 border-4 border-slate-50 ring-8 ring-transparent'}
                                `}
                            >
                                {item.status === 'completed' ? <Check className="w-8 h-8 font-black" /> : <span className="text-3xl font-black font-outfit">{index + 1}</span>}
                            </motion.div>

                            <div className="flex-1">
                                <Card
                                    className={`
                                        cursor-pointer transition-all rounded-[3.5rem] overflow-hidden border-none
                                        ${expanded === item.id
                                            ? 'bg-white shadow-[0_50px_100px_-20px_rgba(1,118,211,0.1)] scale-[1.02]'
                                            : 'bg-white/40 hover:bg-white hover:shadow-2xl opacity-90 hover:opacity-100'}
                                    `}
                                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                                >
                                    <div className="p-10">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-3xl font-black text-slate-900 font-outfit leading-none">{item.title}</h3>
                                                    {item.status === 'completed' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-200">MASTERED</span>}
                                                </div>
                                                <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> ~2 HR INTENSIVE</span>
                                                    <span className="flex items-center gap-2"><Target className="w-4 h-4 text-orange-400" /> {item.status} Phase</span>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${expanded === item.id ? 'bg-brand-blue text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-brand-blue hover:scale-110'}`}>
                                                <ChevronDown className="w-6 h-6" />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expanded === item.id && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="mt-10 pt-10 border-t border-slate-50 space-y-10 animate-slide-up">
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4 pl-2">Objective Mission</p>
                                                            <p className="text-slate-600 leading-[1.8] text-xl font-medium">{item.description}</p>
                                                        </div>

                                                        {item.resources && (
                                                            <div className="space-y-6">
                                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] pl-2">Tactical Resources & Redirects</p>
                                                                <div className="grid sm:grid-cols-2 gap-4">
                                                                    {item.resources.split(',').map((res: string, i: number) => (
                                                                        <a
                                                                            key={i}
                                                                            href={getResourceLink(res.trim(), item.title)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between group/res hover:bg-brand-blue hover:text-white hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform active:scale-95"
                                                                        >
                                                                            <span className="font-black text-lg">{res.trim()}</span>
                                                                            <div className="w-10 h-10 rounded-xl bg-white text-brand-blue flex items-center justify-center opacity-0 group-hover/res:opacity-100 transition-all shadow-xl">
                                                                                <ExternalLink className="w-5 h-5" />
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="pt-6">
                                                            {item.status !== 'completed' ? (
                                                                <Button
                                                                    onClick={(e) => { e.stopPropagation(); startModuleTest(item.id); }}
                                                                    className="w-full h-20 gap-4 text-xl font-black rounded-[2rem] bg-slate-900 text-white hover:bg-slate-800 shadow-2xl group active:scale-[0.98] transition-all"
                                                                >
                                                                    <Brain className="w-8 h-8 text-blue-400 group-hover:rotate-12 transition-transform" /> START FINAL ASSESSMENT
                                                                </Button>
                                                            ) : (
                                                                <div className="p-8 bg-emerald-50 border-4 border-dashed border-emerald-100 text-emerald-700 rounded-[2.5rem] flex flex-col items-center gap-3">
                                                                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg mb-2">
                                                                        <CheckCircle2 className="w-10 h-10" />
                                                                    </div>
                                                                    <p className="text-2xl font-black uppercase font-outfit tracking-widest capitalize">Mission Successful</p>
                                                                    <p className="font-bold opacity-60">Verified Skill Proficiency in {item.title}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Perspective: Intelligence & Help */}
                <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-10 h-fit">
                    <Card className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden group border-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full" />
                        <Sparkles className="w-10 h-10 text-brand-blue mb-6 group-hover:animate-pulse" />
                        <h4 className="text-2xl font-black font-outfit mb-4 leading-tight">AI Career Specialist</h4>
                        <p className="text-slate-400 font-medium leading-[1.6]">
                            Stay focused on <span className="text-white font-bold">{modules?.find(m => m.status === 'in_progress')?.title || 'the next module'}</span>.
                            Users who complete this blueprint within 14 days see a 40% higher recall rate in technical rounds.
                        </p>
                    </Card>

                    <Card className="p-10 bg-white rounded-[3.5rem] border-none shadow-xl space-y-6">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-400" /> Explorer Level
                        </h5>
                        <div className="space-y-4">
                            {[
                                { label: 'Knowledge Base', value: '4,250 XP', color: 'bg-blue-50 text-blue-600' },
                                { label: 'Assistance Requests', value: 'Unlimited', color: 'bg-emerald-50 text-emerald-600' },
                                { label: 'Verified Badges', value: '12 Earned', color: 'bg-indigo-50 text-indigo-600' }
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                    <span className="font-bold text-slate-500 text-sm">{stat.label}</span>
                                    <span className={`px-4 py-1.5 rounded-xl font-black text-xs ${stat.color}`}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Assessment UI (Merged into high fidelity style) */}
            <AnimatePresence>
                {quiz && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-3xl w-full">
                            <Card className="p-12 rounded-[4rem] bg-white border-none shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
                                <div className="absolute top-0 left-0 w-full h-3 bg-brand-blue" />
                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-blue-50 rounded-[2rem] flex items-center justify-center text-brand-blue shadow-lg">
                                            <Brain className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black font-outfit text-slate-900">Skill Validation</h2>
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Assessment: Module {quizModuleId}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setQuiz(null)} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors font-black text-slate-400">ESC</button>
                                </div>

                                <div className="space-y-12">
                                    {quiz.map((q: any, i: number) => (
                                        <div key={i} className="space-y-6">
                                            <div className="flex gap-6">
                                                <span className="w-10 h-10 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-black shrink-0 text-xl shadow-lg ring-4 ring-blue-50">{i + 1}</span>
                                                <p className="text-2xl font-black text-slate-800 leading-tight font-outfit">{q.question}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                                                {q.options.map((opt: string, oi: number) => (
                                                    <button
                                                        key={oi}
                                                        onClick={() => handleAnswerSelect(i, oi)}
                                                        className={`
                                                            p-6 border-4 rounded-[2rem] text-left transition-all font-bold text-lg leading-relaxed relative overflow-hidden group
                                                            ${quizAnswers[i] === oi
                                                                ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-2xl shadow-blue-500/10'
                                                                : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200 text-slate-600'}
                                                        `}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-16 flex gap-6">
                                    <Button onClick={() => setQuiz(null)} variant="ghost" className="h-20 flex-1 text-slate-400 font-black text-xl hover:bg-slate-50 rounded-[2rem]">Abandon</Button>
                                    <Button
                                        onClick={submitQuiz}
                                        disabled={submittingTest || quizAnswers.includes(-1)}
                                        variant="premium"
                                        className="h-20 flex-1 text-xl font-black rounded-[2rem] bg-brand-blue shadow-2xl shadow-blue-500/40 gap-4"
                                    >
                                        {submittingTest ? <Loader2 className="animate-spin" /> : <>FINALIZE ASSESSMENT <ArrowRight className="w-6 h-6" /></>}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
