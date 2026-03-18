"use client"

import React, { useState, useEffect, useRef } from 'react';
import {
    Brain, Send, Zap, Sparkles, Loader2, MessageSquare,
    ShieldCheck, Trophy, Target as TargetIcon, Cpu, X, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Safely coerce an AI response item to a displayable string */
const safeStr = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    // Object returned by AI instead of a string — extract the most useful field
    if (typeof val === 'object') {
        return val.skill || val.text || val.title || val.name || val.description ||
            val.recommendation || val.category || val.question ||
            Object.values(val).filter(v => typeof v === 'string').join(' · ') ||
            JSON.stringify(val);
    }
    return String(val);
};

const CARD: React.CSSProperties = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '1.25rem' };
const SURFACE: React.CSSProperties = { background: 'var(--background)', border: '1px solid var(--card-border)', borderRadius: '0.75rem' };
const LABEL: React.CSSProperties = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: 'var(--text-muted)' };

const QUICK_PROMPTS = [
    "How do I prepare for system design?",
    "What are the top skills for my role?",
    "Help me improve my resume summary",
    "How do I negotiate salary?"
];

export default function CareerCoachPage() {
    const [messages, setMessages] = useState<any[]>([
        { role: 'assistant', content: "Hi! I'm your AI Career Coach. I can help with interview prep, resume tips, career strategy, and more. What would you like to work on today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [auditData, setAuditData] = useState<any>(null);
    const [loadingAudit, setLoadingAudit] = useState(false);
    const [strategicInsights, setStrategicInsights] = useState<any>(null);
    const [loadingStrategic, setLoadingStrategic] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/auth/me');
                setUser(res.data);
                fetchStrategicInsights();
            } catch (err) { }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const query = text || input;
        if (!query.trim() || loading) return;
        const newMsg = { role: 'user', content: query };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);
        try {
            // Slice out the first welcome message or keep it, up to you. Let's just pass everything except the query being typed right now (since it is appended already in state).
            // Wait, we just appended the user msg to `prev` above `setMessages(prev => [...prev, newMsg]);`
            // But we don't have access to the latest state immediately unless we build it:
            const historyToSent = [...messages, newMsg].map(m => ({ role: m.role, content: m.content }));
            const res = await api.post('/api/coach/chat', { query, history: historyToSent });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I ran into an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAudit = async () => {
        setLoadingAudit(true);
        try {
            const res = await api.get('/api/coach/resume-coach');
            setAuditData(res.data);
        } catch { } finally { setLoadingAudit(false); }
    };

    const fetchStrategicInsights = async () => {
        setLoadingStrategic(true);
        try {
            const res = await api.get('/api/coach/strategic-insights');
            setStrategicInsights(res.data);
        } catch { } finally { setLoadingStrategic(false); }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>AI Career Coach</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Your personalized career strategist — available 24/7.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    AI Online
                </div>
            </div>

            {/* Today's Focus */}
            {strategicInsights?.today_focus && (
                <div className="p-6 rounded-2xl talvix-gradient text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                        <TargetIcon className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">Today's Focus</p>
                        <h2 className="text-lg font-bold max-w-2xl">{strategicInsights.today_focus}</h2>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Chat */}
                <div className="lg:col-span-8 space-y-5">
                    <div className="rounded-2xl flex flex-col overflow-hidden" style={{ ...CARD, height: '600px' }}>
                        {/* Chat header */}
                        <div className="px-6 py-4 flex items-center justify-between shrink-0"
                            style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--background)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl talvix-gradient flex items-center justify-center text-white">
                                    <Brain size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>AI Career Coach</p>
                                    <p className="text-[10px]" style={{ color: 'var(--accent-blue)' }}>Powered by Talvix Intelligence</p>
                                </div>
                            </div>
                            <button onClick={() => setMessages([messages[0]])}
                                className="p-2 rounded-xl transition-all text-xs font-semibold"
                                style={{ color: 'var(--text-muted)', background: 'var(--surface-hover)' }}
                                title="Clear chat">
                                <X size={15} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
                            {messages.map((msg, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-lg talvix-gradient flex items-center justify-center text-white shrink-0 mt-0.5">
                                            <Brain size={14} />
                                        </div>
                                    )}
                                        <div
                                        className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium"
                                        style={msg.role === 'user' ? {
                                            background: 'var(--accent-blue)',
                                            color: '#fff',
                                            borderBottomRightRadius: '4px'
                                        } : {
                                            ...SURFACE,
                                            color: 'var(--text-secondary)',
                                            borderBottomLeftRadius: '4px'
                                        }}>
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:p-3 prose-pre:rounded-xl prose-li:my-1">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                            style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                                            <User size={14} />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 rounded-lg talvix-gradient flex items-center justify-center text-white shrink-0">
                                        <Brain size={14} />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl flex items-center gap-2" style={SURFACE}>
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <motion.div key={i}
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ background: 'var(--text-muted)' }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 shrink-0" style={{ borderTop: '1px solid var(--card-border)', background: 'var(--background)' }}>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ask anything about your career..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={loading || !input.trim()}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white talvix-gradient transition-all active:scale-90 disabled:opacity-40">
                                    <Send size={15} />
                                </button>
                            </div>
                            {/* Quick prompts */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {QUICK_PROMPTS.map((p, i) => (
                                    <button key={i} onClick={() => sendMessage(p)}
                                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                                        style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-blue)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* HR Questions */}
                    <div className="p-6 rounded-2xl space-y-5" style={CARD}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>HR Readiness Questions</h3>
                                <p style={{ ...LABEL, fontSize: '9px' }}>Key behavioral scenarios to practice</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {loadingStrategic ? (
                                <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-blue)' }} /></div>
                            ) : strategicInsights?.hr_questions?.map((q: any, i: number) => (
                                <div key={i} className="flex gap-3 p-4 rounded-xl transition-all cursor-default" style={SURFACE}
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-blue)40'}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)'}
                                >
                                    <span className="text-[11px] font-black shrink-0 w-6 h-6 rounded-lg talvix-gradient text-white flex items-center justify-center">{i + 1}</span>
                                    <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{safeStr(q)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Mission summary */}
                    <div className="p-6 rounded-2xl talvix-gradient text-white space-y-5">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">Target Mission</p>
                            <p className="text-xl font-bold">{user?.target_company || 'General Market'}</p>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">Role Focus</p>
                            <p className="text-lg font-bold">{user?.target_role || 'Any Role'}</p>
                        </div>
                    </div>

                    {/* Resume Audit */}
                    <div className="p-6 rounded-2xl space-y-4" style={CARD}>
                        <div className="flex items-center gap-3">
                            <Zap size={16} style={{ color: '#f59e0b' }} />
                            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Resume Audit</h4>
                        </div>
                        <button
                            onClick={fetchAudit}
                            disabled={loadingAudit}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white talvix-gradient transition-all active:scale-95 flex items-center justify-center gap-2">
                            {loadingAudit ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                            {loadingAudit ? 'Analyzing...' : 'Run Audit'}
                        </button>
                        <AnimatePresence>
                            {auditData && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4"
                                    style={{ borderTop: '1px solid var(--card-border)' }}>
                                    <div className="flex items-center justify-between p-4 rounded-xl" style={SURFACE}>
                                        <span style={LABEL}>Audit Score</span>
                                        <span className="text-2xl font-black" style={{ color: 'var(--accent-blue)' }}>{auditData.score}<span className="text-sm opacity-40">/100</span></span>
                                    </div>
                                    {auditData.quick_wins?.[0] && (
                                        <div className="p-3 rounded-xl text-xs font-medium italic leading-relaxed" style={{ background: 'rgba(34,197,94,0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(34,197,94,0.15)' }}>
                                            💡 "{safeStr(auditData.quick_wins[0])}"
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Skill Recommendations */}
                    <div className="p-6 rounded-2xl space-y-4" style={CARD}>
                        <div className="flex items-center gap-3">
                            <Trophy size={16} style={{ color: 'var(--accent-blue)' }} />
                            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Skill Recommendations</h4>
                        </div>
                        <div className="space-y-2">
                            {loadingStrategic ? (
                                <div className="py-4 flex justify-center"><Loader2 size={18} className="animate-spin" style={{ color: 'var(--accent-blue)' }} /></div>
                            ) : strategicInsights?.skill_recommendations?.slice(0, 4).map((rec: any, i: number) => (
                                <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent-blue)' }} />
                                    <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{safeStr(rec)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
