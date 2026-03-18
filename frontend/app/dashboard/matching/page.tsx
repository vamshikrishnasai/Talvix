"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Target, Search, CheckCircle2, AlertCircle, Loader2, Sparkles, Brain, ArrowUpRight, FileText, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function MatchingPage() {
    const [matching, setMatching] = useState(false);
    const [jdText, setJdText] = useState("");
    const [matchResult, setMatchResult] = useState<any>(null);
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [loadingResumes, setLoadingResumes] = useState(true);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await api.get('/api/resume/my-resumes');
                setResumes(res.data);
                if (res.data.length > 0) setSelectedResumeId(res.data[0].id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingResumes(false);
            }
        };
        fetchResumes();
    }, []);

    const runMatch = async () => {
        if (!selectedResumeId || !jdText.trim()) return;
        setMatching(true);
        try {
            const res = await api.post('/api/jd/match', {
                resume_id: selectedResumeId,
                jd_text: jdText
            });
            setMatchResult(res.data);
        } catch (error) {
            alert("Match analysis failed. Try a different JD or Resume.");
        } finally {
            setMatching(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 animate-slide-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                        <Target className="w-3 h-3" /> Technical Synergist
                    </div>
                    <h1 className="text-4xl lg:text-7xl font-black font-outfit text-slate-900 leading-tight tracking-tight">JD <span className="text-brand-blue">Synergist</span></h1>
                    <p className="text-slate-500 font-medium text-xl max-w-2xl leading-relaxed">Cross-modality matching between your professional experience and industry requirements.</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Inputs Column */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                    <Card className="p-10 rounded-[3.5rem] border-none shadow-xl bg-white space-y-10 group">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3 pl-2">
                                <FileText className="w-4 h-4 text-brand-blue" /> Choose Intelligence Source
                            </p>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {loadingResumes ? (
                                    <Loader2 className="animate-spin text-slate-200" />
                                ) : resumes.length > 0 ? resumes.map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedResumeId(r.id)}
                                        className={`px-8 py-5 rounded-[2rem] font-black text-sm whitespace-nowrap transition-all border-4 flex flex-col gap-1 items-start shadow-xl active:scale-95 ${selectedResumeId === r.id ? 'border-brand-blue bg-white text-brand-blue shadow-blue-500/10' : 'border-slate-50 bg-slate-50 text-slate-400 opacity-60'}`}
                                    >
                                        <span className="text-[10px] opacity-40">RESUME ASSET</span>
                                        {r.file_path.split('.')[0]}
                                    </button>
                                )) : (
                                    <p className="text-sm text-red-500 font-bold p-4 bg-red-50 rounded-2xl border border-red-100 w-full text-center">Please upload a resume first.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 pl-2">
                                <Brain className="w-4 h-4 text-orange-400" /> Target Requirements (JD)
                            </p>
                            <textarea
                                className="w-full h-80 p-8 rounded-[3rem] bg-slate-50/50 border-none focus:outline-none focus:ring-[1rem] focus:ring-blue-500/10 focus:bg-white transition-all font-medium text-slate-800 leading-relaxed resize-none text-lg shadow-inner"
                                placeholder="Paste the descriptive requirements here. Our AI will extract keywords and semantic vectors..."
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                            />
                        </div>

                        <Button
                            disabled={matching || !jdText.trim() || !selectedResumeId}
                            onClick={runMatch}
                            className="w-full h-20 text-xl font-black gap-4 shadow-2xl shadow-blue-500/20 bg-brand-blue hover:bg-brand-blue/90 rounded-[2rem] transform active:scale-[0.98] transition-all"
                        >
                            {matching ? <Loader2 className="animate-spin w-8 h-8" /> : <><Sparkles className="w-8 h-8" /> CALCULATE SYNERGY</>}
                        </Button>
                    </Card>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                    <AnimatePresence mode="wait">
                        {matching ? (
                            <motion.div key="matching" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="h-full">
                                <Card className="p-32 flex flex-col items-center justify-center text-center bg-white rounded-[4rem] border-none shadow-2xl space-y-8 min-h-[600px]">
                                    <div className="relative">
                                        <div className="w-32 h-32 border-8 border-blue-50 border-t-brand-blue rounded-full animate-spin" />
                                        <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-brand-blue animate-pulse" />
                                    </div>
                                    <h3 className="text-4xl font-black font-outfit text-slate-900 tracking-tight">Mapping Technical Vectors</h3>
                                    <p className="text-slate-500 font-medium max-w-sm text-lg leading-relaxed">Isolating overlapping competencies and performing deep gap analysis using AI-driven semantic search.</p>
                                </Card>
                            </motion.div>
                        ) : matchResult ? (
                            <motion.div key="result" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                <div className="grid sm:grid-cols-2 gap-10">
                                    <Card className="p-12 rounded-[4rem] border-none shadow-2xl bg-slate-900 text-white overflow-hidden relative group">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue opacity-20 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4" />
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-10 relative z-10">Competitive Index</p>
                                        <div className="flex items-baseline gap-2 relative z-10">
                                            <span className="text-9xl font-black font-outfit tracking-tighter text-white">{Math.round(matchResult.match_score)}</span>
                                            <span className="text-4xl font-black text-slate-700">%</span>
                                        </div>
                                        <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 relative z-10 flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full animate-pulse ${matchResult.match_score > 70 ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                            <p className="text-sm font-bold text-slate-400">Your profile shows a <span className="text-white">{matchResult.match_score > 70 ? 'High Proficiency' : 'Moderate Alignment'}</span> with the target role requirements.</p>
                                        </div>
                                    </Card>

                                    <Card className="p-10 rounded-[4rem] border-none shadow-xl bg-white space-y-12">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-lg"><CheckCircle2 className="w-9 h-9" /></div>
                                            <div>
                                                <h4 className="font-black text-2xl text-slate-900 font-outfit">Core Synergy</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Matching competencies</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {matchResult.gap_analysis.strong.map((s: string, i: number) => (
                                                <span key={i} className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-[1.5rem] text-xs font-black border border-emerald-100 shadow-sm flex items-center gap-2">
                                                    <Zap className="w-3 h-3" /> {s}
                                                </span>
                                            ))}
                                        </div>
                                    </Card>
                                </div>

                                <Card className="p-16 rounded-[5rem] border-none shadow-2xl bg-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem]" />
                                    <div className="flex items-center gap-8 mb-12">
                                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2.5rem] flex items-center justify-center shadow-lg"><AlertCircle className="w-10 h-10" /></div>
                                        <div>
                                            <h4 className="text-4xl font-black font-outfit text-slate-900 tracking-tight leading-none mb-2">Technical Gaps</h4>
                                            <p className="text-lg font-medium text-slate-400">Isolating missing skillsets for immediate remedial work.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {matchResult.gap_analysis.missing.map((s: string, i: number) => (
                                            <div key={i} className="px-8 py-5 bg-red-50/50 rounded-[2.5rem] border border-red-50 text-red-700 font-black text-lg flex items-center gap-4 group/gap hover:bg-white hover:border-red-500 transition-all cursor-default">
                                                <div className="w-3 h-3 rounded-full bg-red-500/20 group-hover:bg-red-500 transition-colors" />
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-16 pt-12 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-8">
                                        <div className="text-center sm:text-left">
                                            <p className="text-[10px] font-black text-slate-400 pl-1 uppercase tracking-[0.3em] mb-3">Reconnaissance Action</p>
                                            <p className="font-black text-2xl text-slate-900 leading-tight">Ready to close these <br />gaps in your blueprint?</p>
                                        </div>
                                        <Button onClick={() => window.location.href = '/dashboard/roadmap'} className="h-20 px-12 bg-slate-900 text-white font-black text-xl rounded-[2rem] gap-4 shadow-2xl shadow-black/10 transition-all transform active:scale-95 group">
                                            UPDATE ROADMAP <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-full">
                                <Card className="p-32 h-full flex flex-col items-center justify-center text-center bg-white/40 border-8 border-dashed border-slate-100 rounded-[5rem] space-y-10 group hover:bg-white hover:border-blue-50 transition-all">
                                    <div className="w-32 h-32 bg-slate-50 rounded-[3.5rem] flex items-center justify-center text-slate-200 group-hover:text-brand-blue group-hover:scale-110 transition-all duration-700">
                                        <Search className="w-16 h-16" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-4xl font-black font-outfit text-slate-300 group-hover:text-slate-900 transition-colors">Command Sequence Standby</h3>
                                        <p className="text-slate-400 max-w-md font-medium text-xl leading-relaxed">Paste a target JD and select your professional source experience to reveal the high-fidelity synergy index.</p>
                                    </div>
                                    <div className="flex items-center gap-12 pt-8 opacity-10 filter grayscale group-hover:opacity-40 transition-opacity">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex flex-col items-center gap-4"><div className="w-14 h-14 rounded-3xl bg-slate-300" /><div className="w-16 h-3 bg-slate-200" /></div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
