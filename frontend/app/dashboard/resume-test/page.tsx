"use client"

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Brain,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowRight,
    Trophy,
    ShieldCheck,
    AlertCircle,
    Info,
    Sparkles,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function ResumeSkillTest() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                // Fetch assessment based on last uploaded resume
                const res = await api.get('/api/assessment/assessment');
                setQuestions(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, []);

    const handleAnswerClick = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
        setIsAnswered(true);

        if (index === questions[currentIndex].correct_answer_index) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            submitResults();
        }
    };

    const submitResults = async () => {
        const finalScore = (score / questions.length) * 100;
        try {
            // Find latest resume to update score
            const resumes = await api.get('/api/resume/my-resumes');
            if (resumes.data.length > 0) {
                const latest = resumes.data[resumes.data.length - 1];
                await api.post(`/api/resume/submit-exam/${latest.id}`, { score: finalScore });
            }
        } catch (err) {
            console.error(err);
        }
        setShowResults(true);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin" />
                <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-500 animate-pulse" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Simulating skill scenarios...</p>
        </div>
    );

    if (!questions.length) return (
        <div className="max-w-xl mx-auto py-20 text-center space-y-8 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-slate-100 shadow-sm">
                <AlertCircle className="w-10 h-10 text-slate-300" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">No Profile Intelligence Found</h1>
                <p className="text-slate-500 font-medium">Please upload a resume on the dashboard first so we can analyze your skills and generate a targeted assessment.</p>
            </div>
            <Button onClick={() => window.location.href = '/dashboard'} className="bg-blue-600 text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                Go to Dashboard
            </Button>
        </div>
    );

    if (showResults) return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto py-12 space-y-10 px-4">
            <Card className="p-12 text-center bg-white border-none shadow-2xl rounded-[3rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 premium-gradient" />
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-white">
                    <Trophy className="w-10 h-10" />
                </div>

                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Skill Test Results</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-8">Intelligence Validation Complete</p>

                <div className="flex justify-center gap-12 mb-10">
                    <div className="text-center">
                        <p className="text-4xl font-black text-slate-900 leading-none">{score}/{questions.length}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Score</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-black text-blue-600 leading-none">{Math.round((score / questions.length) * 100)}%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Proficiency</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Button onClick={() => window.location.href = '/dashboard'} className="w-full h-16 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-lg">
                        Back to Intelligence Feed
                    </Button>
                    <p className="text-xs text-slate-400 font-medium italic">These results will be integrated into your AI-driven performance summary.</p>
                </div>
            </Card>
        </motion.div>
    );

    const q = questions[currentIndex];

    return (
        <div className={`transition-all duration-500 px-4 ${isFullScreen ? 'fixed inset-0 z-[200] bg-slate-50 overflow-y-auto py-20' : 'max-w-[800px] mx-auto py-12 space-y-10'}`}>
            <div className={`flex justify-between items-center mb-8 ${isFullScreen ? 'max-w-4xl mx-auto' : 'px-4'}`}>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        variant="outline"
                        className="p-3 h-12 w-12 rounded-xl border-slate-200"
                    >
                        {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 border-none">Skill Verification</h1>
                        <p className="text-slate-500 font-medium text-xs tracking-tight">Question {currentIndex + 1} of {questions.length}</p>
                    </div>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/50">
                    <Brain className="w-6 h-6" />
                </div>
            </div>

            <Card className={`bg-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden ${isFullScreen ? 'max-w-4xl mx-auto p-16' : 'p-10'}`}>
                <div
                    className="absolute top-0 left-0 h-1.5 bg-blue-500 transition-all duration-700"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />

                <div className="space-y-8">
                    <div className="space-y-4">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                            Skill Domain Check
                        </span>
                        <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                            {q.question}
                        </h2>
                    </div>

                    <div className="grid gap-4">
                        {q.options.map((opt: string, i: number) => {
                            const isSelected = selectedAnswer === i;
                            const isCorrect = i === q.correct_answer_index;

                            let buttonStyles = "border-[3px] border-slate-50 bg-white text-slate-700 hover:border-blue-500/30 hover:bg-slate-50";
                            if (isAnswered) {
                                if (isCorrect) buttonStyles = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-500/10";
                                else if (isSelected) buttonStyles = "border-red-500 bg-red-50 text-red-900 shadow-md shadow-red-500/10";
                                else buttonStyles = "border-slate-50 opacity-40 grayscale pointer-events-none";
                            } else if (isSelected) {
                                buttonStyles = "border-blue-500 bg-blue-50 text-blue-900 shadow-md shadow-blue-500/10";
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleAnswerClick(i)}
                                    disabled={isAnswered}
                                    className={`w-full p-6 text-left rounded-3xl transition-all font-bold flex items-center justify-between group ${buttonStyles}`}
                                >
                                    <span className="flex-1 pr-6">{opt}</span>
                                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                                    {!isAnswered && <div className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-slate-200 group-hover:border-blue-400'}`} />}
                                </button>
                            );
                        })}
                    </div>

                    <AnimatePresence>
                        {isAnswered && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-slate-50">
                                <Button onClick={handleNext} className="w-full h-16 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 gap-3 active:scale-[0.98] transition-all">
                                    {currentIndex < questions.length - 1 ? 'Next Challenge' : 'Finalize Validation'} <ArrowRight className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>

            <div className={`p-6 bg-slate-50/80 rounded-[2rem] border-2 border-dashed border-slate-200 flex gap-4 items-start ${isFullScreen ? 'max-w-4xl mx-auto mt-8' : ''}`}>
                <div className="p-2 bg-white rounded-xl border border-slate-200 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Mission-Critical Verification</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">This test verifies key technical competencies identified in your profile analysis. High scores contribute to professional dossier certification.</p>
                </div>
            </div>
        </div>
    );
}
