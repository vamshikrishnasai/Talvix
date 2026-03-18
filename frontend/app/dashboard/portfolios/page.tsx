"use client"

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Sparkles,
    User,
    Trash2,
    Loader2,
    ExternalLink,
    Code2,
    Share2,
    Eye,
    Layout,
    Building2,
    Zap,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function PortfoliosPage() {
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchPortfolios();
    }, []);

    const fetchPortfolios = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/portfolio/');
            setPortfolios(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const generatePortfolio = async () => {
        try {
            setGenerating(true);
            await api.post('/api/portfolio/generate');
            await fetchPortfolios();
        } catch (error) {
            alert("Synthesis error. Please ensure your profile is complete.");
        } finally {
            setGenerating(false);
        }
    };

    const deletePortfolio = async (id: number) => {
        if (!confirm("Delete this portfolio?")) return;
        try {
            await api.delete(`/api/portfolio/${id}`);
            setPortfolios(portfolios.filter(p => p.id !== id));
        } catch (error) { }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Identity Vault...</p>
        </div>
    );

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 border-none">Technical Portfolios</h1>
                    <p className="text-slate-500 font-medium">Auto-generated portfolios based on your best technical projects.</p>
                </div>
                <Button
                    onClick={generatePortfolio}
                    disabled={generating}
                    className="h-12 px-8 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 gap-2 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Synthesize New
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolios.length > 0 ? portfolios.map((portfolio, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={portfolio.id}>
                        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all group h-full flex flex-col rounded-[2.5rem]">
                            <div className="h-24 bg-slate-50 relative">
                                <div className="absolute -bottom-8 left-8 w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shadow-sm group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                                    <User className="w-8 h-8" />
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deletePortfolio(portfolio.id); }}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-8 pt-12 space-y-6 flex-1 flex flex-col">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{portfolio.title}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{portfolio.contact_info?.email}</p>
                                </div>

                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    "{portfolio.bio}"
                                </p>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Code2 className="w-3.5 h-3.5 text-blue-500" /> Featured Artifacts
                                    </p>
                                    <div className="space-y-3">
                                        {portfolio.projects?.slice(0, 2).map((proj: any, pi: number) => (
                                            <div key={pi} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-all">
                                                <p className="text-xs font-bold text-slate-700 leading-none mb-1">{proj.title}</p>
                                                <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{proj.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 flex gap-3">
                                    <Button className="flex-1 h-12 bg-white border border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all">
                                        View Portfolio <Eye className="ml-2 w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" className="p-3 bg-slate-50 text-slate-400 font-bold rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-32 text-center space-y-8 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-slate-300 shadow-sm">
                            <Layout className="w-10 h-10" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Identity Vault Empty</h3>
                            <p className="text-slate-400 font-medium text-sm max-w-sm mx-auto">Click the button above to synthesize your first professional technical portfolio.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
