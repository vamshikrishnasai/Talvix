"use client"

import React, { useState, useEffect } from 'react';
import {
    Library, Video, FileText, Globe, Search, ExternalLink,
    Loader2, BookOpen, PlayCircle, ArrowRight, Sparkles,
    Download, Target, Cpu, Filter, Star
} from 'lucide-react';
import api from '@/lib/api';
import { jsPDF } from "jspdf";
import { motion } from 'framer-motion';

const CARD: React.CSSProperties = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '1.25rem' };
const SURFACE: React.CSSProperties = { background: 'var(--background)', border: '1px solid var(--card-border)', borderRadius: '0.75rem' };
const LABEL: React.CSSProperties = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: 'var(--text-muted)' };

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
    Video: { icon: PlayCircle, color: '#ef4444' },
    Article: { icon: FileText, color: 'var(--accent-blue)' },
    Docs: { icon: BookOpen, color: '#6366f1' },
    default: { icon: Globe, color: '#22c55e' },
};

export default function ResourcesPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pyqs, setPyqs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [resRes, pyqRes, uRes] = await Promise.all([
                    api.get('/api/roadmap/resources'),
                    api.get('/api/roadmap/company-pyqs'),
                    api.get('/api/auth/me')
                ]);
                setResources(resRes.data || []);
                setPyqs(pyqRes.data || []);
                setUser(uRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, []);

    const downloadPYQ = () => {
        if (!pyqs.length) return;
        const doc = new jsPDF() as any;
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text("Talvix: Company PYQ Vault", 20, 20);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 130);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
        let y = 45;
        pyqs.forEach((q, i) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFontSize(12);
            doc.setTextColor(30, 30, 50);
            doc.text(`${i + 1}. ${q.question}`, 20, y, { maxWidth: 170 });
            y += (doc.getTextDimensions(q.question, { maxWidth: 170 }).h + 5);
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 130);
            doc.text(`Topic: ${q.topic} | Difficulty: ${q.difficulty}`, 20, y);
            y += 10;
        });
        doc.save("talvix_pyq_vault.pdf");
    };

    const filters = ['All', 'Video', 'Article', 'Docs'];
    const filteredResources = resources.filter(res => {
        const matchSearch = res.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = activeFilter === 'All' || res.type === activeFilter;
        return matchSearch && matchFilter;
    });

    const quickLinks = [
        { title: 'W3Schools', url: 'https://www.w3schools.com', type: 'Docs', desc: 'Web fundamentals reference.' },
        { title: 'GeeksForGeeks', url: 'https://www.geeksforgeeks.org', type: 'Article', desc: 'DSA and system design.' },
        { title: 'YouTube Tech', url: 'https://www.youtube.com', type: 'Video', desc: 'Visual tutorials.' },
        { title: 'LeetCode', url: 'https://leetcode.com', type: 'Docs', desc: 'Coding interview practice.' },
    ];

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Resource Library</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Curated learning material tailored to your career goal{user?.target_role ? ` in ${user.target_role}` : ''}.
                    </p>
                </div>
                {/* Search */}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border max-w-xs w-full transition-all"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <Search size={15} style={{ color: 'var(--text-muted)' }} />
                    <input
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none border-none text-sm flex-1"
                        style={{ color: 'var(--text-primary)' }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--accent-blue)' }} />
                    <p style={LABEL}>Loading resources...</p>
                </div>
            ) : (
                <div className="space-y-10">

                    {/* PYQ Vault Banner */}
                    {pyqs.length > 0 && (
                        <div className="p-8 rounded-2xl relative overflow-hidden talvix-gradient text-white">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <Cpu className="w-48 h-48 rotate-12" />
                            </div>
                            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Star className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold">Company PYQ Vault</h2>
                                    </div>
                                    <p className="text-blue-100 text-sm font-medium max-w-lg">
                                        {pyqs.length} curated questions from past hiring rounds at top companies. Download your personalized prep pack.
                                    </p>
                                </div>
                                <button
                                    onClick={downloadPYQ}
                                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white font-bold text-sm transition-all active:scale-95"
                                    style={{ color: 'var(--accent-blue)' }}
                                >
                                    <Download size={16} /> Export PDF
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    {user && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Target size={16} style={{ color: 'var(--accent-blue)' }} />
                                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Recommended for You</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {quickLinks.map((link, i) => {
                                    const cfg = TYPE_CONFIG[link.type] || TYPE_CONFIG.default;
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => window.open(link.url, '_blank')}
                                            className="p-5 rounded-2xl cursor-pointer group transition-all space-y-3"
                                            style={CARD}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLDivElement).style.borderColor = cfg.color + '50';
                                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)';
                                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: cfg.color + '12', color: cfg.color }}>
                                                <cfg.icon size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{link.title}</p>
                                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{link.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Filter + Resource Grid */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Library size={16} style={{ color: 'var(--accent-blue)' }} />
                                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                                    All Resources <span style={{ color: 'var(--text-muted)' }}>({filteredResources.length})</span>
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {filters.map(f => (
                                    <button key={f} onClick={() => setActiveFilter(f)}
                                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                                        style={{
                                            background: activeFilter === f ? 'var(--accent-blue)' : 'var(--surface-hover)',
                                            color: activeFilter === f ? '#fff' : 'var(--text-secondary)',
                                        }}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredResources.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-5">
                                {filteredResources.map((res, i) => {
                                    const cfg = TYPE_CONFIG[res.type] || TYPE_CONFIG.default;
                                    return (
                                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                            <div className="p-6 rounded-2xl flex flex-col gap-5 group transition-all cursor-pointer h-full" style={CARD}
                                                onClick={() => window.open(res.url, '_blank')}
                                                onMouseEnter={e => {
                                                    (e.currentTarget as HTMLDivElement).style.borderColor = cfg.color + '40';
                                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseLeave={e => {
                                                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)';
                                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.color + '12', color: cfg.color }}>
                                                        <cfg.icon size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ background: cfg.color + '10', color: cfg.color }}>
                                                        {res.type}
                                                    </span>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <h3 className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{res.title}</h3>
                                                    <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{res.description}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-semibold"
                                                    style={{ color: 'var(--text-muted)' }}>
                                                    Open Resource <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-24 text-center space-y-3 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--card-border)' }}>
                                <Sparkles size={28} className="mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                    {searchTerm ? `No results for "${searchTerm}"` : 'No resources found for this filter.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
