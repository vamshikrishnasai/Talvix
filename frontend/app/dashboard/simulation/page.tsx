"use client"

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Video,
    Play,
    Loader2,
    Sparkles,
    CheckCircle2,
    Trophy,
    ArrowRight,
    Building2,
    Brain,
    ShieldCheck,
    Briefcase,
    Globe,
    ChevronRight,
    MessageSquare,
    Zap,
    History,
    X,
    Clock,
    Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function SimulationPage() {
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [simulation, setSimulation] = useState<any>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [results, setResults] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/api/simulation/history');
            setHistory(res.data);
        } catch (error) { }
    };

    const startSimulation = async () => {
        if (!company) {
            alert("Please enter a company name.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post(`/api/simulation/start?company=${encodeURIComponent(company)}`);
            setSimulation(response.data);
            setAnswers(response.data.questions.map((q: any) => ({ id: q.id, answer: '' })));
            setSimulating(true);
            setResults(null);
        } catch (error) {
            alert("Failed to start simulation.");
        } finally {
            setLoading(false);
        }
    };

    const submitSimulation = async () => {
        if (answers.some(a => !a.answer.trim())) {
            alert("Please answer all questions before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post(`/api/simulation/submit/${simulation.id}`, answers);
            setResults(response.data);
            setSimulating(false);
            fetchHistory();
        } catch (error) {
            alert("Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnswerChange = (id: number, val: string) => {
        setAnswers(answers.map(a => a.id === id ? { ...a, answer: val } : a));
    };

    if (simulating && simulation) return (
        <div className="max-w-[1000px] mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 border-none">{simulation.company_name}</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Mock Interview for {simulation.role}</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-bold">Interview Live</span>
                </div>
            </header>

            <div className="space-y-8">
                {simulation.questions.map((q: any, i: number) => (
                    <Card key={q.id} className="p-8 border-slate-200 bg-white shadow-sm space-y-6 rounded-[2.5rem]">
                        <div className="flex gap-6">
                            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 shrink-0">{i + 1}</span>
                            <div className="space-y-6 flex-1">
                                <p className="text-xl font-bold text-slate-800 leading-snug">{q.question}</p>
                                <textarea
                                    value={answers.find(a => a.id === q.id)?.answer || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    rows={6}
                                    placeholder="Type your response here..."
                                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-semibold leading-relaxed transition-all focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </Card>
                ))}

                <div className="flex gap-4 pt-6">
                    <Button onClick={() => setSimulating(false)} variant="ghost" className="h-12 flex-1 text-slate-400 font-bold uppercase text-xs">Cancel</Button>
                    <Button
                        onClick={submitSimulation}
                        disabled={submitting}
                        className="h-12 flex-1 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit for Evaluation"}
                    </Button>
                </div>
            </div>
        </div>
    );

    if (results) return (
        <div className="max-w-[1000px] mx-auto space-y-10 pb-20 px-4 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-8 py-10">
                <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-green-500 shadow-sm border border-green-100">
                    <Trophy className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-4xl font-bold text-slate-900 border-none">Interview Results: {Math.round(results.overall_score)}%</h2>
                    <p className="text-lg text-slate-500 font-medium">Readiness: {results.overall_score > 70 ? 'Industry Ready' : 'Needs Practice'}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Detailed Feedback</h3>
                    {results.responses?.map((res: any, idx: number) => (
                        <Card key={idx} className="p-8 border-slate-200 bg-white shadow-sm space-y-4 rounded-[2.5rem]">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Question {idx + 1}</span>
                                <span className="text-lg font-bold text-slate-900">{res.score}/10</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 italic border-l-4 border-blue-100 pl-4 py-1">"{res.feedback}"</p>
                        </Card>
                    ))}
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-8 bg-blue-600 text-white border-none rounded-[2.5rem] shadow-xl shadow-blue-500/20 space-y-6">
                        <Sparkles className="w-8 h-8 opacity-50" />
                        <h4 className="font-bold text-lg mb-2">Performance Summary</h4>
                        <p className="text-xs text-blue-100 font-medium leading-relaxed italic">"{results.readiness_report}"</p>
                        <Button onClick={() => window.print()} className="w-full bg-white/20 text-white font-bold h-10 rounded-xl hover:bg-white/30 transition-all text-xs uppercase tracking-widest gap-2">
                            <Download className="w-4 h-4" /> Download PDF
                        </Button>
                    </Card>
                    <Button onClick={() => setResults(null)} variant="outline" className="w-full h-12 border-slate-200 text-slate-500 font-bold uppercase rounded-xl">Start Another</Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1000px] mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 border-none">Interview Simulations</h1>
                    <p className="text-slate-500 font-medium">Practice real interviews with AI that provide real-time feedback.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="p-10 border-slate-200 bg-white shadow-sm space-y-8 rounded-[2.5rem]">
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-blue-600" /> Start New Simulation
                            </h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Company</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="e.g. Google, Apple, Amazon..."
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                <Brain className="w-5 h-5 text-indigo-500" />
                                <span className="text-xs font-bold text-slate-600">Adaptive Intensity</span>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                <span className="text-xs font-bold text-slate-600">Full Appraisal</span>
                            </div>
                        </div>

                        <Button
                            onClick={startSimulation}
                            disabled={loading}
                            className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Deploy Simulation"}
                        </Button>
                    </Card>
                </div>

                <Card className="p-8 border-slate-200 bg-white shadow-sm space-y-6 rounded-[2.5rem]">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History className="w-4 h-4" /> Previous Runs
                    </h3>
                    <div className="space-y-4">
                        {history.length > 0 ? history.slice(0, 5).map((h, i) => (
                            <div key={h.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-blue-200">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-bold text-slate-800">{h.company_name}</p>
                                    <span className="text-xs font-bold text-blue-600">{Math.round(h.overall_score)}%</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{h.role}</p>
                            </div>
                        )) : (
                            <div className="py-10 text-center opacity-40">
                                <p className="text-xs font-bold uppercase tracking-widest">No history yet</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
