"use client"

import React, { useState, useEffect } from 'react';
import {
    Calendar, Target, CheckCircle2, Clock, Plus, Loader2,
    ExternalLink, ChevronRight, BookOpen, ShieldCheck, Briefcase,
    Sparkles, ArrowRight, Zap, X, MessageSquare, Trophy, AlertCircle,
    ChevronLeft, Mic, Send, History as HistoryIcon,
} from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';

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

const CARD: React.CSSProperties = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '1.25rem' };
const SURFACE: React.CSSProperties = { background: 'var(--background)', border: '1px solid var(--card-border)', borderRadius: '0.75rem' };
const LABEL: React.CSSProperties = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: 'var(--text-muted)' };

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'Pending' },
    completed: { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', label: 'Completed' },
    selected: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', label: 'Advanced' },
};

export default function MyInterviewPage() {
    const [rounds, setRounds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingRound, setAddingRound] = useState(false);
    const [newRoundName, setNewRoundName] = useState('');
    const [selectedRound, setSelectedRound] = useState<any>(null);
    const [showAddInput, setShowAddInput] = useState(false);

    // Mock Interview State
    const [isSimulating, setIsSimulating] = useState(false);
    const [mockType, setMockType] = useState('Technical');
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [pastSims, setPastSims] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Conversational State
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [currentChatMsg, setCurrentChatMsg] = useState("");
    const [isListening, setIsListening] = useState(false);

    useEffect(() => { 
        fetchRounds(); 
        fetchSimulations();
    }, []);

    const fetchRounds = async () => {
        try {
            const res = await api.get('/api/interview/rounds');
            setRounds(res.data);
            if (res.data.length > 0 && !selectedRound) setSelectedRound(res.data[0]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addRound = async () => {
        if (!newRoundName.trim() || addingRound) return;
        setAddingRound(true);
        try {
            await api.post('/api/interview/add-round', { round_name: newRoundName });
            setNewRoundName('');
            setShowAddInput(false);
            await fetchRounds();
        } catch { } finally { setAddingRound(false); }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/api/interview/update-status/${id}`, { status });
            await fetchRounds();
        } catch { }
    };

    const synthesize = async () => {
        setLoading(true);
        try {
            await api.post('/api/interview/predict-rounds');
            await fetchRounds();
        } catch { } finally { setLoading(false); }
    };

    const fetchSimulations = async () => {
        try {
            const res = await api.get('/api/interview/simulations');
            setPastSims(res.data);
        } catch { }
    };

    const startMock = async (type: string) => {
        setLoading(true);
        setMockType(type);
        setChatHistory([]);
        setAnalysisResult(null);
        setIsSimulating(true);
        try {
            const res = await api.post('/api/interview/chat-mock', {
                mock_type: type,
                history: [],
                current_message: ""
            });
            const aiMsg = { role: 'assistant', content: res.data.response };
            setChatHistory([aiMsg]);
            speak(aiMsg.content);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChatSubmit = async () => {
        if (!currentChatMsg.trim() || isAnalyzing) return;
        
        const userMsg = { role: 'user', content: currentChatMsg };
        const newHistory = [...chatHistory, userMsg];
        setChatHistory(newHistory);
        setCurrentChatMsg("");
        setIsAnalyzing(true);

        try {
            const res = await api.post('/api/interview/chat-mock', {
                mock_type: mockType,
                history: chatHistory,
                current_message: currentChatMsg
            });
            const aiMsg = { role: 'assistant', content: res.data.response };
            setChatHistory(prev => [...prev, aiMsg]);
            speak(aiMsg.content);
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setCurrentChatMsg(prev => prev + " " + transcript);
        };
        recognition.start();
    };

    const submitMock = async () => {
        setIsAnalyzing(true);
        try {
            // Filter only Q&A pairs from chat for evaluation
            const qas: any[] = [];
            for (let i = 0; i < chatHistory.length - 1; i++) {
                if (chatHistory[i].role === 'assistant' && chatHistory[i+1].role === 'user') {
                    qas.push({
                        question: chatHistory[i].content,
                        answer: chatHistory[i+1].content
                    });
                }
            }

            const res = await api.post('/api/interview/submit-mock', {
                questions: qas.map(x => x.question),
                answers: qas.map(x => x.answer),
                mock_type: mockType
            });
            setAnalysisResult(res.data.analysis);
            fetchSimulations();
        } catch { } finally { setIsAnalyzing(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--accent-blue)' }} />
            <p style={LABEL}>Loading interview pipeline...</p>
        </div>
    );

    return (
        <div className="max-w-[1240px] mx-auto space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Interview Pipeline</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Track every round, study the right topics, and stay prepared.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border border-card-border"
                        style={{ color: 'var(--text-primary)', background: 'var(--card-bg)' }}>
                        <HistoryIcon size={16} /> History
                    </button>
                    <button
                        onClick={synthesize}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white talvix-gradient transition-all active:scale-95"
                        style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                        <Sparkles size={16} /> AI Strategy
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Left: Pipeline */}
                <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <p style={LABEL}>Rounds ({rounds.length})</p>
                        <button onClick={() => setShowAddInput(!showAddInput)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            style={{ color: 'var(--accent-blue)', background: 'rgba(37,99,235,0.06)' }}>
                            <Plus size={14} /> Add Round
                        </button>
                    </div>

                    {/* Add input */}
                    <AnimatePresence>
                        {showAddInput && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--accent-blue)', background: 'var(--card-bg)' }}>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Round name..."
                                        value={newRoundName}
                                        onChange={e => setNewRoundName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addRound()}
                                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                                        style={{ color: 'var(--text-primary)' }}
                                    />
                                    <button onClick={addRound} disabled={!newRoundName || addingRound}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white talvix-gradient shrink-0">
                                        {addingRound ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                    </button>
                                    <button onClick={() => setShowAddInput(false)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ color: 'var(--text-muted)', background: 'var(--surface-hover)' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Rounds list */}
                    {rounds.length === 0 ? (
                        <div className="py-12 text-center rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--card-border)' }}>
                            <Briefcase size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No rounds yet</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Click AI Strategy or add one manually</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {rounds.map((round) => {
                                const isActive = selectedRound?.id === round.id;
                                const status = STATUS_CONFIG[round.status] || STATUS_CONFIG.pending;
                                return (
                                    <div key={round.id} onClick={() => setSelectedRound(round)}
                                        className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                                        style={{
                                            background: isActive ? 'var(--accent-blue)' : 'var(--card-bg)',
                                            border: `1px solid ${isActive ? 'var(--accent-blue)' : 'var(--card-border)'}`,
                                        }}
                                        onMouseEnter={e => {
                                            if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-blue)40';
                                        }}
                                        onMouseLeave={e => {
                                            if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)';
                                        }}
                                    >
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: isActive ? 'rgba(255,255,255,0.2)' : status.bg, color: isActive ? '#fff' : status.color }}>
                                            {round.status === 'selected' ? <CheckCircle2 size={17} /> : <Clock size={17} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate" style={{ color: isActive ? '#fff' : 'var(--text-primary)' }}>
                                                {round.round_name}
                                            </p>
                                            <p className="text-[10px] font-semibold mt-0.5" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : status.color }}>
                                                {status.label}
                                            </p>
                                        </div>
                                        <ChevronRight size={16} style={{ color: isActive ? '#fff' : 'var(--text-muted)' }} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Round Detail */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {selectedRound ? (
                            <motion.div key={selectedRound.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                                {/* Round header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl" style={CARD}>
                                    <div>
                                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedRound.round_name}</h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                                                style={{ background: (STATUS_CONFIG[selectedRound.status] || STATUS_CONFIG.pending).bg, color: (STATUS_CONFIG[selectedRound.status] || STATUS_CONFIG.pending).color }}>
                                                {(STATUS_CONFIG[selectedRound.status] || STATUS_CONFIG.pending).label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(selectedRound.id, 'completed')}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                                            style={{ border: '1px solid var(--card-border)', color: 'var(--text-secondary)', background: 'transparent' }}
                                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'}
                                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                                            Mark Complete
                                        </button>
                                        <button onClick={() => updateStatus(selectedRound.id, 'selected')}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white talvix-gradient transition-all active:scale-95">
                                            Advanced ✓
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    {/* Focus Topics */}
                                    <div className="p-6 rounded-2xl space-y-4" style={CARD}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--accent-blue)' }}>
                                                <Target size={17} />
                                            </div>
                                            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Focus Topics</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {selectedRound.round_intel?.focus_topics?.length ? (
                                                selectedRound.round_intel.focus_topics.map((topic: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all" style={SURFACE}>
                                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent-blue)' }} />
                                                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{safeStr(topic)}</p>
                                                    </div>
                                                ))
                                            ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No focus topics found.</p>}
                                        </div>
                                    </div>

                                    {/* Expected Questions */}
                                    <div className="p-6 rounded-2xl space-y-4" style={CARD}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e' }}>
                                                <ShieldCheck size={17} />
                                            </div>
                                            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Expected Questions</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {selectedRound.round_intel?.expected_questions?.length ? (
                                                selectedRound.round_intel.expected_questions.map((q: any, i: number) => (
                                                    <div key={i} className="flex gap-3 p-3 rounded-xl" style={SURFACE}>
                                                        <span className="text-[11px] font-black shrink-0 w-5 h-5 rounded-lg talvix-gradient flex items-center justify-center text-white">{i + 1}</span>
                                                        <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{safeStr(q)}</p>
                                                    </div>
                                                ))
                                            ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No questions generated.</p>}
                                        </div>
                                        <div className="pt-2">
                                            <button 
                                                onClick={() => startMock(selectedRound.round_name.includes('HR') ? 'Behavioral' : 'Technical')}
                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-card-border hover:border-emerald-500/50"
                                                style={{ color: '#22c55e', background: 'rgba(34,197,94,0.04)' }}>
                                                <Mic size={14} /> Start Mock AI Interview
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Resources */}
                                {selectedRound.round_intel?.resources?.length > 0 && (
                                    <div className="p-6 rounded-2xl space-y-4" style={CARD}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>
                                                <BookOpen size={17} />
                                            </div>
                                            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Study Resources</h4>
                                        </div>
                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {selectedRound.round_intel.resources.map((res: any, i: number) => (
                                                <div key={i} onClick={() => window.open(res.url, '_blank')}
                                                    className="p-4 rounded-xl cursor-pointer group transition-all" style={SURFACE}
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-blue)40';
                                                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)';
                                                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    <ExternalLink size={16} className="mb-3" style={{ color: 'var(--accent-blue)' }} />
                                                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{res.title}</p>
                                                    <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                                                        Visit <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="py-32 text-center space-y-4 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--card-border)' }}>
                                <Briefcase size={36} className="mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                                <p className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>Select a round to view details</p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Or use AI Strategy to auto-generate your pipeline.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mock Interview Simulation Overlay */}
            <AnimatePresence>
                {isSimulating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
                        <Card className="max-w-[800px] w-full max-h-[90vh] overflow-y-auto talvix-card p-0 border-none relative bg-[#0a0a0f]">
                            {/* Close Button */}
                            {!isAnalyzing && (
                                <button onClick={() => setIsSimulating(false)} 
                                    className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-20">
                                    <X size={24} />
                                </button>
                            )}

                            {analysisResult ? (
                                <div className="p-10 space-y-8 animate-in fade-in zoom-in duration-500">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <div className="w-16 h-16 rounded-full talvix-gradient flex items-center justify-center text-white mb-2 shadow-lg shadow-blue-500/40">
                                            <Trophy size={32} />
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Evaluation Complete</h2>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-white/40 uppercase tracking-widest">Readiness Score</span>
                                            <span className="text-2xl font-black text-blue-400">{analysisResult.overall_score}%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                                <CheckCircle2 size={14} /> Coach Insights
                                            </h3>
                                            <p className="text-sm text-white/80 leading-relaxed font-medium">{analysisResult.readiness_report}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Answer Analysis</h3>
                                            {analysisResult.feedback_per_question?.map((f: any, i: number) => (
                                                <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <p className="text-[10px] font-black text-white/20">QUESTION 0{i+1}</p>
                                                        <div className="px-2 py-1 bg-white/10 rounded text-[9px] font-black text-white uppercase">Score: {f.score}%</div>
                                                    </div>
                                                    <p className="text-sm font-bold text-white leading-snug">{f.question}</p>
                                                    <div className="flex gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                                        <Sparkles className="shrink-0 text-emerald-500" size={16} />
                                                        <div>
                                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Better Approach</p>
                                                            <p className="text-xs text-emerald-400/80 leading-relaxed italic">{f.better_answer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={() => setIsSimulating(false)} 
                                        className="w-full py-4 rounded-2xl text-xs font-black text-white talvix-gradient uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20">
                                        Return to Pipeline
                                    </button>
                                </div>
                            ) : (
                                <div className="p-8 space-y-8 min-h-[600px] flex flex-col">
                                    {/* Chat Header */}
                                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                                <MessageSquare size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Conversational AI</p>
                                                <h3 className="text-lg font-black text-white uppercase tracking-tight">{mockType} Interview</h3>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={submitMock}
                                            disabled={chatHistory.length < 3 || isAnalyzing}
                                            className="px-6 py-2.5 rounded-xl text-[10px] font-black text-white talvix-gradient uppercase tracking-widest disabled:opacity-30">
                                            End & Analyze
                                        </button>
                                    </div>

                                    {/* Chat Window */}
                                    <div className="flex-1 overflow-y-auto space-y-6 py-6 px-2 scrollbar-hide">
                                        {chatHistory.map((msg, i) => (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                                key={i} 
                                                className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                                                    msg.role === 'assistant' 
                                                    ? 'bg-white/5 text-white/90 border border-white/10' 
                                                    : 'talvix-gradient text-white shadow-lg'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {isAnalyzing && (
                                            <div className="flex justify-start">
                                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Input Area */}
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={startListening}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/40 hover:text-white'}`}>
                                                <Mic size={20} />
                                            </button>
                                            <div className="flex-1 relative">
                                                <input 
                                                    type="text"
                                                    value={currentChatMsg}
                                                    onChange={e => setCurrentChatMsg(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
                                                    placeholder="Type your response or speak..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                                />
                                            </div>
                                            <button 
                                                onClick={handleChatSubmit}
                                                disabled={!currentChatMsg.trim() || isAnalyzing}
                                                className="w-12 h-12 rounded-xl talvix-gradient flex items-center justify-center text-white disabled:opacity-20">
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* History Overlay */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
                        <Card className="max-w-[600px] w-full max-h-[80vh] overflow-y-auto talvix-card p-8 border-none space-y-8 bg-[#0a0a0f]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Interview History</h3>
                                <button onClick={() => setShowHistory(false)}><X className="text-white/40 hover:text-white" /></button>
                            </div>
                            <div className="space-y-4">
                                {pastSims.length === 0 ? (
                                    <div className="py-20 text-center opacity-30">No simulations recorded.</div>
                                ) : pastSims.map((sim, i) => (
                                    <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-sm">
                                                {Math.round(sim.overall_score)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-tight">{sim.role}</p>
                                                <p className="text-[10px] text-white/40">{new Date(sim.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Details</button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
