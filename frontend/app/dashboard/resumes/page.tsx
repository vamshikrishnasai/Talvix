"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Upload,
    FileText,
    Plus,
    Star,
    Search,
    Brain,
    Target,
    ShieldCheck,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Zap,
    Download,
    Trash2,
    Clock,
    X,
    ChevronRight,
    ArrowRight,
    Trophy,
    RefreshCw,
    Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

// Question Types
type Question = {
    id: number;
    type: 'MCQ' | 'FILL_BLANK' | 'MATCH_FOLLOWING' | 'ARRANGE_ORDER';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
};

export default function ResumesPage() {
    const [uploading, setUploading] = useState(false);
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

    // Exam State
    const [showExam, setShowExam] = useState(false);
    const [examQuestions, setExamQuestions] = useState<Question[]>([]);
    const [loadingExam, setLoadingExam] = useState(false);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const [examSubmitted, setExamSubmitted] = useState(false);
    const [examScore, setExamScore] = useState(0);

    useEffect(() => {
        fetchResumes();
    }, []);

    useEffect(() => {
        let timer: any;
        if (showExam && timeLeft > 0 && !examSubmitted) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && !examSubmitted) {
            handleSubmitExam();
        }
        return () => clearInterval(timer);
    }, [showExam, timeLeft, examSubmitted]);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/resume/my-resumes');
            setResumes(response.data);
            if (response.data.length > 0 && !selectedResumeId) {
                setSelectedResumeId(response.data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch resumes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await api.post('/api/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchResumes();
            setSelectedResumeId(response.data.id);
        } catch (error: any) {
            console.error("Upload failed", error);
            const detail = error.response?.data?.detail || "Mission asset synchronization failed. Ensure valid PDF content.";
            alert(`ANALYSIS ERROR: ${detail}`);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const startExam = async () => {
        if (!selectedResumeId) return;
        setLoadingExam(true);
        try {
            const res = await api.get(`/api/resume/generate-exam/${selectedResumeId}`);
            setExamQuestions(res.data);
            setAnswers({});
            setCurrentQIndex(0);
            setTimeLeft(1800);
            setExamSubmitted(false);
            setShowExam(true);
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to start exam.");
        } finally {
            setLoadingExam(false);
        }
    };

    const handleAnswer = (qIdx: number, ans: any) => {
        setAnswers(prev => ({ ...prev, [qIdx]: ans }));
    };

    const handleNext = () => {
        if (currentQIndex < examQuestions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        }
    };

    const clearResponse = () => {
        setAnswers(prev => {
            const newAns = { ...prev };
            delete newAns[currentQIndex];
            return newAns;
        });
    };

    const handleSubmitExam = async () => {
        const attemptedCount = Object.keys(answers).length;
        if (!confirm(`You have attempted ${attemptedCount} out of ${examQuestions.length} questions. Are you sure you want to submit?`)) {
            return;
        }

        let correctCount = 0;
        examQuestions.forEach((q, idx) => {
            if (answers[idx] === q.correct_index) {
                correctCount++;
            }
        });

        const score = (correctCount / examQuestions.length) * 100;
        setExamScore(score);
        setExamSubmitted(true);

        try {
            await api.post(`/api/resume/submit-exam/${selectedResumeId}?score=${score}`);
            fetchResumes(); // Refresh to update score
        } catch (err) {
            console.error(err);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const selectedResume = resumes.find(r => r.id === selectedResumeId);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 animate-slide-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-8">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em] border border-brand-blue/20">
                        <ShieldCheck className="w-3 h-3" /> Talvix Portfolios
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black font-outfit text-slate-900 leading-tight tracking-tighter">
                        Asset <span className="text-brand-blue">Intelligence</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-2xl leading-relaxed">
                        Precision analysis for the modern career landscape. Build Skills. <span className="text-brand-blue font-bold">Get Hired.</span>
                    </p>
                </div>
                <Button
                    variant="premium"
                    className="h-20 px-12 rounded-[2rem] shadow-2xl shadow-brand-blue/30 bg-brand-blue hover:bg-brand-blue/90 text-lg font-black"
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <Plus className="mr-3 w-7 h-7" /> UPLOAD NEW ASSET
                </Button>
            </header>

            <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={handleUpload} />

            <div className="grid lg:grid-cols-12 gap-12">
                {/* Left: Enhanced Asset List */}
                <div className="lg:col-span-4 space-y-8">
                    <h3 className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] flex items-center gap-3 pl-4">
                        <Zap className="w-4 h-4 text-orange-500" /> MISSION INVENTORY
                    </h3>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                <Loader2 className="animate-spin text-brand-blue w-12 h-12 mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing...</p>
                            </div>
                        ) : resumes.length > 0 ? resumes.map(r => (
                            <Card
                                key={r.id}
                                className={`
                                    cursor-pointer transition-all border-none rounded-[2.5rem] overflow-hidden group relative
                                    ${selectedResumeId === r.id ? 'bg-white shadow-[0_40px_80px_-20px_rgba(1,118,211,0.15)] ring-4 ring-brand-blue/20' : 'bg-white/40 border border-slate-100 opacity-60 hover:opacity-100 hover:bg-white'}
                                `}
                                onClick={() => setSelectedResumeId(r.id)}
                            >
                                <div className="p-8 flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${selectedResumeId === r.id ? 'bg-brand-blue text-white scale-110' : 'bg-slate-50 text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue'}`}>
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-black text-slate-900 truncate text-lg leading-tight mb-2">{r.file_path}</p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-xl">
                                                <Trophy className="w-3 h-3 text-emerald-600" />
                                                <span className="text-[10px] font-black text-emerald-700">{Math.round(r.ats_score)}% ATS</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.uploaded_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )) : (
                            <div className="p-16 text-center bg-slate-100 rounded-[3rem] border-4 border-dashed border-slate-200">
                                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Awaiting Command Input.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Comprehensive Analysis */}
                <div className="lg:col-span-8 space-y-12">
                    <AnimatePresence mode="wait">
                        {uploading ? (
                            <motion.div key="uploading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
                                <Card className="rounded-[4rem] bg-slate-900 border-none shadow-2xl overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center text-center p-20">
                                    <div className="absolute top-0 left-0 w-full h-3 bg-slate-800">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 6, ease: "easeInOut" }} className="h-full bg-brand-blue shadow-[0_0_20px_#0176d3]" />
                                    </div>
                                    <div className="w-40 h-40 bg-white/5 rounded-[4rem] p-1 border border-white/10 flex items-center justify-center mb-12 relative">
                                        <div className="absolute inset-0 rounded-[4.5rem] border-2 border-brand-blue/20 animate-ping" />
                                        <Loader2 className="w-20 h-20 text-brand-blue animate-spin" />
                                    </div>
                                    <h3 className="text-5xl font-black text-white font-outfit tracking-tight">Deep Vector Scan</h3>
                                    <p className="text-slate-400 font-medium text-xl mt-6 max-w-sm leading-relaxed">Extracting latent skill embeddings and cross-referencing industry standard taxonomies...</p>
                                </Card>
                            </motion.div>
                        ) : selectedResume ? (
                            <motion.div key="analysis" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                                {/* ATS Intelligence Header */}
                                <div className="grid md:grid-cols-2 gap-10">
                                    <Card className="p-12 bg-slate-900 text-white rounded-[4rem] shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-2/3 h-full bg-brand-blue/20 blur-[120px] -rotate-45 translate-x-1/4" />
                                        <div className="flex items-center justify-between mb-10 relative z-10">
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">GENUINE ATS INDEX</p>
                                            <ShieldCheck className="w-10 h-10 text-emerald-400" />
                                        </div>
                                        <div className="flex items-baseline gap-4 relative z-10">
                                            <span className="text-9xl font-black font-outfit tracking-tighter leading-none">{Math.round(selectedResume.ats_score)}</span>
                                            <span className="text-4xl font-black text-slate-600">/100</span>
                                        </div>
                                        <p className="text-slate-400 text-xl font-medium leading-relaxed mt-8 relative z-10">
                                            Your asset demonstrates <span className="text-white font-bold">{selectedResume.ats_score > 75 ? 'Strategic Alignment' : 'Fundamental Capability'}</span> for highly competitive roles.
                                        </p>
                                    </Card>

                                    <Card className="p-10 bg-white rounded-[4rem] border-none shadow-xl flex flex-col justify-between">
                                        <div className="space-y-8">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-6">Skill Map Extraction</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(selectedResume.extracted_skills || []).map((s: string, i: number) => (
                                                        <span key={i} className="px-5 py-2.5 bg-slate-50 rounded-2xl text-xs font-black text-slate-800 border border-slate-100 hover:border-brand-blue transition-all cursor-default">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest pl-2 mb-6">Identified Gaps (Missing)</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(selectedResume.missing_skills || ["System Design", "Cloud Architecture"]).map((s: string, i: number) => (
                                                        <span key={i} className="px-5 py-2.5 bg-red-50 rounded-2xl text-xs font-black text-red-600 border border-red-100">
                                                            + {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
                                            <Button variant="ghost" className="text-slate-400 font-black hover:text-red-500 rounded-2xl gap-2 h-14">
                                                <Trash2 className="w-5 h-5" /> DELETE
                                            </Button>
                                            <Button variant="premium" className="h-14 px-8 rounded-2xl font-black gap-2">
                                                <Download className="w-5 h-5" /> DOWNLOAD PDF
                                            </Button>
                                        </div>
                                    </Card>
                                </div>

                                {/* AI Recommendations */}
                                <Card className="p-12 rounded-[4rem] bg-indigo-50 border-none shadow-xl space-y-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/40 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-lg">
                                            <Brain className="w-9 h-9" />
                                        </div>
                                        <h3 className="text-3xl font-black font-outfit text-indigo-900">Talvix Recommendations</h3>
                                    </div>
                                    <p className="text-indigo-900/70 text-lg font-medium leading-[1.8] pl-2 border-l-4 border-indigo-200">
                                        {selectedResume.ai_recommendations || "Focus on quantifying your impact with data-driven metrics. Highlight specific technologies in your latest projects to better align with senior role expectations."}
                                    </p>
                                </Card>

                                {/* Skill Assessment Trigger */}
                                <Card className="p-12 rounded-[5rem] bg-white border-none shadow-2xl space-y-10 relative group">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                        <div className="space-y-4 text-center md:text-left">
                                            <h3 className="text-4xl font-black font-outfit text-slate-900 leading-tight">Verify Talent Authenticity</h3>
                                            <p className="text-slate-500 text-lg font-medium max-w-md">Conduct a 30-question high-fidelity technical assessment based on your extracted curriculum.</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-6">
                                            {selectedResume.assessment_attempted === 1 ? (
                                                <div className="text-center">
                                                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                                                        <CheckCircle2 className="w-12 h-12" />
                                                    </div>
                                                    <p className="text-2xl font-black text-emerald-700">{Math.round(selectedResume.assessment_score)}% Score</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Attempted</p>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={startExam}
                                                    disabled={loadingExam}
                                                    className="h-24 px-16 bg-brand-blue text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-500/30 transform hover:scale-105 active:scale-95 transition-all gap-4"
                                                >
                                                    {loadingExam ? <Loader2 className="animate-spin" /> : <><Zap className="w-8 h-8" /> TAKE SKILL TEST</>}
                                                </Button>
                                            )}
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Valid for single attempt</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-60 border-8 border-dashed border-slate-100 rounded-[5rem] text-center bg-white/50 group hover:border-brand-blue/10 transition-all duration-700">
                                <div className="w-32 h-32 bg-slate-50 rounded-[4rem] flex items-center justify-center text-slate-300 mb-12 group-hover:bg-brand-blue/5 group-hover:text-brand-blue transition-all duration-500">
                                    <Upload className="w-16 h-16" />
                                </div>
                                <h3 className="text-5xl font-black text-slate-900 font-outfit tracking-tight">System Ready</h3>
                                <p className="text-slate-500 max-w-sm font-medium text-xl mt-6 leading-relaxed">Intelligence awaits. Upload your professional blueprint to begin the Talvix evaluation sequence.</p>
                                <Button
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    className="mt-12 h-20 px-16 bg-brand-blue text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-500/20"
                                >
                                    INITIALIZE SCAN
                                </Button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* FULL SCREEN EXAM INTERFACE */}
            <AnimatePresence>
                {showExam && examQuestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[1000] bg-white flex flex-col no-scrollbar overflow-y-auto"
                    >
                        {/* Exam Header */}
                        <div className="bg-slate-900 text-white px-10 py-6 flex items-center justify-between sticky top-0 z-10 shadow-xl">
                            <div className="flex items-center gap-6">
                                <div className="p-3 bg-brand-blue rounded-2xl">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black font-outfit">Talvix Technical Assessment</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate Validation Matrix | 30 Questions</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="flex flex-col items-center px-8 border-r border-white/10">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Time Remaining</p>
                                    <div className="flex items-center gap-3 text-3xl font-black font-outfit text-brand-blue">
                                        <Timer className="w-6 h-6 animate-pulse" /> {formatTime(timeLeft)}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowExam(false)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X className="w-8 h-8" />
                                </Button>
                            </div>
                        </div>

                        {/* Exam Content */}
                        {!examSubmitted ? (
                            <div className="flex-1 flex max-w-screen-2xl mx-auto w-full p-12 gap-12 h-[calc(100vh-100px)]">
                                {/* Question Sidebar */}
                                <div className="w-80 shrink-0 space-y-8 h-full">
                                    <Card className="p-8 rounded-[3rem] bg-slate-50 border-none shadow-inner h-full overflow-y-auto">
                                        <div className="grid grid-cols-5 gap-3">
                                            {examQuestions.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentQIndex(i)}
                                                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all flex items-center justify-center ${currentQIndex === i ? 'bg-brand-blue text-white shadow-lg' : answers[i] !== undefined ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </Card>
                                </div>

                                {/* Active Question Area */}
                                <div className="flex-1 space-y-10 py-10 overflow-y-auto no-scrollbar">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${examQuestions[currentQIndex].difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600' : examQuestions[currentQIndex].difficulty === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                                            {examQuestions[currentQIndex].difficulty} CORE
                                        </span>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Type: {examQuestions[currentQIndex].type}</span>
                                    </div>

                                    <h3 className="text-4xl font-black font-outfit text-slate-900 leading-[1.3] max-w-4xl">
                                        {examQuestions[currentQIndex].question}
                                    </h3>

                                    <div className="grid gap-6 max-w-4xl">
                                        {examQuestions[currentQIndex].options.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswer(currentQIndex, i)}
                                                className={`p-10 text-left rounded-[2.5rem] text-xl font-bold transition-all border-4 relative overflow-hidden group ${answers[currentQIndex] === i ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-600'}`}
                                            >
                                                <span className="relative z-10">{opt}</span>
                                                <div className={`absolute left-0 top-0 h-full w-2 ${answers[currentQIndex] === i ? 'bg-brand-blue' : 'bg-transparent'}`} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Footer Controls */}
                                    <div className="pt-12 mt-12 border-t border-slate-100 flex items-center justify-between sticky bottom-0 bg-white py-6">
                                        <div className="flex gap-4">
                                            <Button onClick={clearResponse} variant="ghost" className="h-16 px-10 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">
                                                CLEAR RESPONSE
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    if (currentQIndex > 0) setCurrentQIndex(prev => prev - 1);
                                                }}
                                                disabled={currentQIndex === 0}
                                                variant="ghost"
                                                className="h-16 px-10 border-2 border-slate-100 rounded-2xl flex gap-2 font-bold"
                                            >
                                                PREVIOUS
                                            </Button>
                                        </div>

                                        <div className="flex gap-4">
                                            <Button
                                                onClick={handleNext}
                                                disabled={currentQIndex === examQuestions.length - 1}
                                                className="h-16 px-12 border-2 border-brand-blue text-brand-blue rounded-2xl font-black text-lg gap-3 hover:bg-brand-blue hover:text-white transition-all"
                                            >
                                                SAVE & NEXT <ChevronRight className="w-6 h-6" />
                                            </Button>
                                            {currentQIndex === examQuestions.length - 1 && (
                                                <Button
                                                    onClick={handleSubmitExam}
                                                    className="h-16 px-16 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200"
                                                >
                                                    SUBMIT EXAM
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Results View
                            <div className="flex-1 flex flex-col items-center justify-center p-20 animate-slide-up">
                                <div className="max-w-3xl w-full text-center space-y-12">
                                    <div className="relative inline-block">
                                        <div className={`w-48 h-48 rounded-[4rem] flex items-center justify-center text-white shadow-2xl mx-auto ${examScore >= 70 ? 'bg-emerald-500 shadow-emerald-200' : 'bg-orange-500 shadow-orange-200'}`}>
                                            <span className="text-7xl font-black font-outfit">{Math.round(examScore)}%</span>
                                        </div>
                                        <div className="absolute -top-4 -right-4 bg-white p-4 rounded-3xl shadow-xl">
                                            <Trophy className="w-10 h-10 text-brand-blue" />
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-6xl font-black font-outfit text-slate-900 tracking-tight">Deployment Complete</h2>
                                        <p className="text-slate-500 text-2xl font-medium mt-4">
                                            {examScore >= 70
                                                ? "You have successfully validated your domain technical curriculum."
                                                : "Domain validation incomplete. Focus on identified technical gaps."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-8 pt-8">
                                        <div className="p-8 bg-slate-50 rounded-[3rem] text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accuracy</p>
                                            <p className="text-3xl font-black text-slate-900">{Math.round(examScore)}%</p>
                                        </div>
                                        <div className="p-8 bg-slate-50 rounded-[3rem] text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time Spent</p>
                                            <p className="text-3xl font-black text-slate-900">{Math.round((1800 - timeLeft) / 60)}m</p>
                                        </div>
                                        <div className="p-8 bg-slate-50 rounded-[3rem] text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assessment</p>
                                            <p className="text-3xl font-black text-slate-900">{examScore >= 70 ? 'PASS' : 'FAIL'}</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setShowExam(false)}
                                        className="h-20 w-full rounded-[2rem] bg-slate-900 text-white font-black text-xl shadow-2xl"
                                    >
                                        RETURN TO ANALYTICS
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
