"use client"

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Target,
    FileText,
    Zap,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Sparkles,
    Building2,
    ArrowRight,
    Search,
    Download,
    Cpu,
    Briefcase,
    ArrowLeft,
    Plus,
    Link,
    Type
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

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

export default function SynergyPage() {
    const [jdText, setJdText] = useState('');
    const [jdUrl, setJdUrl] = useState('');
    const [inputType, setInputType] = useState<'text' | 'url'>('text');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/api/resume/my-resumes');
            setResumes(res.data);
            if (res.data.length > 0) setSelectedResumeId(res.data[res.data.length - 1].id);
        } catch (error) { }
    };

    const runAnalysis = async () => {
        if ((!jdText && !jdUrl) || !selectedResumeId) return;
        setLoading(true);
        try {
            const response = await api.post('/api/jd/analyze', {
                resume_id: selectedResumeId,
                jd_text: inputType === 'text' ? jdText : '',
                jd_url: inputType === 'url' ? jdUrl : '',
                company: company || "Target Enterprise"
            });
            setAnalysis(response.data.analysis);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (analysis) {
        return (
            <div className="max-w-[1240px] mx-auto space-y-10 animate-fade-in">
                <div className="flex items-center justify-between">
                    <Button
                        onClick={() => setAnalysis(null)}
                        variant="ghost"
                        className="text-text-secondary font-bold text-xs uppercase tracking-widest gap-2 hover:text-accent-blue transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Parameters
                    </Button>
                    <div className="flex gap-3">
                        <Button onClick={() => window.print()} variant="outline" className="h-10 px-6 border-card-border text-text-secondary font-bold text-xs uppercase tracking-widest rounded-xl">
                            <Download className="w-4 h-4 mr-2" /> PDF Export
                        </Button>
                        <Button onClick={() => window.location.href = '/dashboard/roadmaps'} className="talvix-gradient text-white h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/15">
                            Initiate Roadmap
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Score Context */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="talvix-card p-10 flex flex-col items-center justify-center text-center space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Synchronization Score</h3>
                                <p className="text-xs font-medium text-text-secondary">Overall match with requirements</p>
                            </div>

                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="96" cy="96" r="82" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-accent-blue/5" />
                                    <motion.circle
                                        initial={{ strokeDashoffset: 515 }}
                                        animate={{ strokeDashoffset: 515 - (515 * analysis.match_percentage) / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        cx="96" cy="96" r="82" fill="transparent" stroke="currentColor" strokeWidth="12"
                                        className="text-accent-blue"
                                        strokeDasharray={515}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="text-center">
                                    <span className="text-5xl font-black text-text-primary tracking-tighter">{Math.round(analysis.match_percentage)}%</span>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Synergy</p>
                                </div>
                            </div>

                            <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${analysis.match_percentage > 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {analysis.match_percentage > 75 ? 'High Probability' : 'Optimization Required'}
                            </div>
                        </Card>

                        <Card className="p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-accent-blue" />
                                <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Contextual Insights</h4>
                            </div>
                            <p className="text-xs font-medium text-text-secondary leading-relaxed">
                                Our AI has cross-referenced your profile nodes against the job description's latent technical clusters.
                            </p>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Focus Entity</p>
                                    <p className="text-sm font-bold text-text-primary truncate">{company || 'Competitive Market'}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Result Details */}
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="talvix-card p-10 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 talvix-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight text-text-primary uppercase">Strategic Optimizations</h3>
                                    <p className="text-xs font-medium text-text-secondary mt-1">Actionable nodes to maximize synchronization.</p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {analysis.suggestions?.map((sug: string, i: number) => (
                                    <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-card-border flex items-start gap-4 hover:border-accent-blue/20 transition-all group">
                                        <div className="w-6 h-6 bg-accent-blue/5 text-accent-blue rounded text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-accent-blue group-hover:text-white transition-all">{i + 1}</div>
                                        <p className="text-sm font-bold text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">{sug}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Aligned Pillars
                                    </h3>
                                    <span className="text-[10px] font-bold text-text-muted">{analysis.present_skills?.length || 0} Nodes</span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {analysis.present_skills?.map((skill: string, i: number) => (
                                        <span key={i} className="pill-tag bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 font-bold">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Missing Clusters
                                    </h3>
                                    <span className="text-[10px] font-bold text-text-muted">{analysis.missing_skills?.length || 0} Nodes</span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {analysis.missing_skills?.map((skill: string, i: number) => (
                                        <span key={i} className="pill-tag bg-red-500/5 text-red-600 dark:text-red-400 border border-red-500/10 font-bold">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                                {analysis.missing_skills?.length > 0 && (
                                    <div className="pt-4 border-t border-card-border">
                                        <Button variant="ghost" onClick={() => window.location.href = '/dashboard/resources'} className="w-full text-[10px] font-bold text-accent-blue uppercase tracking-widest hover:bg-accent-blue/5">
                                            View Learning Paths <ArrowRight className="ml-2 w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1100px] mx-auto space-y-12 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary uppercase">JD Synergist</h1>
                    <p className="text-sm font-medium text-text-secondary mt-1">Quantify match probability with specific job specifications.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    <Card className="talvix-card p-10 space-y-10 border-none shadow-premium bg-white dark:bg-[#111113]">
                        <div className="grid gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Assigned Mission Entity</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-blue transition-colors">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="e.g. OpenAI, Nvidia, SpaceX..."
                                        className="w-full pl-16 pr-6 h-16 bg-slate-50 dark:bg-slate-900/50 border border-card-border rounded-2xl focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue/30 outline-none font-bold text-text-primary transition-all text-sm uppercase tracking-tight"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between ml-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Job Specification Matrix</label>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setInputType('text')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${inputType === 'text' ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-muted hover:text-text-primary'}`}
                                        >
                                            <Type className="w-3 h-3" /> Text
                                        </button>
                                        <button 
                                            onClick={() => setInputType('url')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${inputType === 'url' ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-muted hover:text-text-primary'}`}
                                        >
                                            <Link className="w-3 h-3" /> URL
                                        </button>
                                    </div>
                                </div>
                                {inputType === 'text' ? (
                                    <textarea
                                        value={jdText}
                                        onChange={(e) => setJdText(e.target.value)}
                                        rows={10}
                                        placeholder="Execute scan: Paste job description text here..."
                                        className="w-full p-10 bg-slate-50 dark:bg-slate-900/50 border border-card-border rounded-[2.5rem] focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue/30 outline-none font-bold text-text-primary leading-relaxed transition-all scrollbar-hide text-sm"
                                    />
                                ) : (
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-blue transition-colors">
                                            <Link className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            value={jdUrl}
                                            onChange={(e) => setJdUrl(e.target.value)}
                                            placeholder="https://company.career.page/job/123"
                                            className="w-full pl-16 pr-6 h-16 bg-slate-50 dark:bg-slate-900/50 border border-card-border rounded-2xl focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue/30 outline-none font-bold text-text-primary transition-all text-sm tracking-tight"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={runAnalysis}
                            disabled={loading || (inputType === 'text' && !jdText) || (inputType === 'url' && !jdUrl)}
                            className="w-full h-16 talvix-gradient text-white font-bold uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-xs"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>Initiate Synergy Protocol <Cpu className="w-5 h-5" /></>
                            )}
                        </Button>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Dossier Selection */}
                    <Card className="talvix-card p-10 space-y-8 border-none bg-white dark:bg-[#111113]">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-accent-blue" />
                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Active Dossier</h3>
                        </div>
                        <div className="grid gap-4">
                            {resumes.map((r) => (
                                <div
                                    key={r.id}
                                    onClick={() => setSelectedResumeId(r.id)}
                                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer group flex flex-col gap-4 ${selectedResumeId === r.id
                                        ? 'border-accent-blue bg-accent-blue/5'
                                        : 'border-transparent bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-bold uppercase tracking-tight ${selectedResumeId === r.id ? 'text-accent-blue' : 'text-text-primary'}`}>
                                            Dossier #{r.id}
                                        </p>
                                        <div className={`w-2 h-2 rounded-full ${selectedResumeId === r.id ? 'bg-accent-blue animate-pulse' : 'bg-text-muted'}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                            <span>Readiness</span>
                                            <span>{Math.round(r.ats_score)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-accent-blue transition-all duration-1000" style={{ width: `${r.ats_score}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full h-12 border-2 border-dashed border-card-border rounded-2xl text-text-muted hover:text-accent-blue hover:border-accent-blue/30 transition-all font-bold text-xs uppercase tracking-widest gap-2">
                                <Plus className="w-4 h-4" /> New Dossier
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-8 talvix-gradient text-white border-none rounded-[2.5rem] shadow-2xl shadow-blue-500/25 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                            <Zap className="w-32 h-32 rotate-12" />
                        </div>
                        <Sparkles className="w-8 h-8 text-white mb-6" />
                        <h4 className="font-bold text-lg tracking-tight mb-2 uppercase">Deep Matching</h4>
                        <p className="text-xs text-white/80 font-medium leading-relaxed">
                            Our neural clusters analyze semantic requirements, identifying keywords that matter most to ATS systems.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
