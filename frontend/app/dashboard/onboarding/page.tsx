"use client"

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    User,
    Briefcase,
    GraduationCap,
    ArrowRight,
    Rocket,
    CheckCircle2,
    Target,
    Loader2,
    Check,
    Brain,
    Info,
    Cpu,
    Zap,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const USR_TYPES = [
    { id: 'STUDENT', label: 'Undergrad', icon: GraduationCap, desc: 'Mastering foundations and core domains' },
    { id: 'FRESHER', label: 'Graduate', icon: Rocket, desc: 'Optimizing for entry-level placements' },
    { id: 'EXPERIENCED', label: 'Professional', icon: Briefcase, desc: 'Advancing career and leadership nodes' },
];

const DOMAINS = [
    'DSA & Algorithms', 'Web Development', 'Mobile Apps', 'Machine Learning',
    'Data Science', 'Cloud & DevOps', 'Cybersecurity', 'System Design',
    'Blockchain', 'Embedded Systems'
];

// Steps for STUDENT:     1=userType → 2=domains → 3=mission → 4=techCheck → 5=final  (5 steps)
// Steps for FRESHER/EXP: 1=userType → 3=mission → 5=final                             (3 steps, no tech check)
export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [type, setType] = useState('');
    const [survey, setSurvey] = useState({
        interests: [] as string[],
        skills: [] as string[],
        target_company: '',
        target_role: '',
        interview_date: '',
        weekly_commitment: 5,
        prep_duration: 4
    });

    const [questions, setQuestions] = useState<any[]>([]);
    const [qIndex, setQIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [loading, setLoading] = useState(false);

    // Stepper display: students show 5 steps, others show 3 (no domain selection, no tech check)
    const isStudent = type === 'STUDENT';
    const totalSteps = isStudent ? 5 : 3;
    // Map actual step numbers to display step numbers for non-students:
    // actual: 1→display 1, 3→display 2, 5→display 3
    const displayStep = isStudent
        ? step
        : step === 1 ? 1 : step === 3 ? 2 : 3;

    /* ── Fetch dynamic MCQ questions from backend ── */
    const fetchQuestions = async (userType: string) => {
        setLoadingQuestions(true);
        try {
            const res = await api.get(`/api/onboarding/questions?user_type=${userType}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setQuestions(data);
            setQIndex(0);
            setAnswers([]);
            setSelectedAnswer(null);
            setStep(4);
        } catch (error) {
            console.error('Failed to fetch questions', error);
            // Use built-in fallback so flow never breaks
            setQuestions(FALLBACK_QUESTIONS);
            setQIndex(0);
            setAnswers([]);
            setSelectedAnswer(null);
            setStep(4);
        } finally {
            setLoadingQuestions(false);
        }
    };

    /* ── Handle MCQ answer selection ── */
    const handleAnswer = (idx: number) => {
        setSelectedAnswer(idx);
    };

    const handleNext = () => {
        if (selectedAnswer === null) return;
        const newAnswers = [...answers, selectedAnswer];
        setAnswers(newAnswers);
        setSelectedAnswer(null);
        if (qIndex < questions.length - 1) {
            setQIndex(qIndex + 1);
        } else {
            setStep(5); // after tech check → final step
        }
    };

    /* ── Step 3 Next: STUDENT fetches questions, others go straight to step 5 ── */
    const handleStep3Next = async () => {
        if (isStudent) {
            await fetchQuestions(type);
        } else {
            setStep(5);
        }
    };

    /* ── Submit onboarding ── */
    const submitOnboarding = async () => {
        setLoading(true);
        let score = 0;
        if (questions.length > 0 && answers.length > 0) {
            const correctCount = answers.filter(
                (ans, idx) => ans === questions[idx]?.correct_answer_index
            ).length;
            score = (correctCount / questions.length) * 100;
        }
        try {
            await api.post('/api/onboarding/survey', {
                ...survey,
                user_type: type,
                interview_date: survey.interview_date ? new Date(survey.interview_date).toISOString() : null,
                knowledge_score: score
            });
            window.location.href = '/dashboard';
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="max-w-5xl mx-auto py-12 px-6 min-h-screen bg-background text-foreground">

            {/* ── Logo ── */}
            <div className="flex justify-center mb-10">
                <img src="/talvix_logo_.png" alt="Talvix" className="h-14 w-auto" />
            </div>

            {/* ── Progress Stepper ── */}
            <div className="flex justify-center items-center gap-3 mb-16 px-4">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
                    <React.Fragment key={s}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-500 border-2
                            ${displayStep >= s ? 'talvix-gradient border-transparent text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-900 border-card-border text-text-muted'}`}>
                            {displayStep > s ? <Check className="w-5 h-5" /> : s}
                        </div>
                        {s < totalSteps && (
                            <div className={`h-1 w-12 rounded-full transition-all duration-700 ${displayStep > s ? 'talvix-gradient' : 'bg-slate-100 dark:bg-slate-800'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ── STEP 1: User Type ── */}
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                        <div className="text-center space-y-3">
                            <h1 className="text-4xl font-bold tracking-tight text-text-primary uppercase">Who are you?</h1>
                            <p className="text-sm font-medium text-text-secondary max-w-lg mx-auto">Select your career archetype so we can personalize your experience.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {USR_TYPES.map(t => (
                                <Card
                                    key={t.id}
                                    className={`cursor-pointer group transition-all duration-300 border-2 p-2 relative overflow-hidden bg-white dark:bg-[#111113]
                                        ${type === t.id ? 'border-accent-blue shadow-2xl shadow-blue-500/10' : 'border-card-border hover:border-accent-blue/40 shadow-premium'}`}
                                    onClick={() => setType(t.id)}
                                >
                                    <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110
                                            ${type === t.id ? 'talvix-gradient text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-900 text-text-muted border border-card-border'}`}>
                                            <t.icon className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg text-text-primary uppercase tracking-tight">{t.label}</h3>
                                            <p className="text-xs text-text-secondary font-medium leading-relaxed">{t.desc}</p>
                                        </div>
                                    </CardContent>
                                    {type === t.id && (
                                        <motion.div layoutId="active-indicator" className="absolute top-4 right-4 text-accent-blue">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </motion.div>
                                    )}
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-center pt-8">
                            <Button
                                disabled={!type}
                                onClick={() => type === 'STUDENT' ? setStep(2) : setStep(3)}
                                className="h-14 px-12 talvix-gradient text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl shadow-blue-500/20 gap-3 active:scale-[0.98] transition-all"
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 2: Domain Interests (STUDENT ONLY) ── */}
                {step === 2 && type === 'STUDENT' && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl font-bold text-text-primary uppercase tracking-tight">Your Interests</h2>
                            <p className="text-sm font-medium text-text-secondary">Select the domains you want to explore and grow in. Pick 1 or more.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                            {DOMAINS.map(domain => (
                                <button
                                    key={domain}
                                    onClick={() => {
                                        const newInterests = survey.interests.includes(domain)
                                            ? survey.interests.filter(i => i !== domain)
                                            : [...survey.interests, domain];
                                        setSurvey({ ...survey, interests: newInterests });
                                    }}
                                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 font-bold text-xs uppercase tracking-wide
                                        ${survey.interests.includes(domain)
                                            ? 'bg-accent-blue border-accent-blue text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-white dark:bg-[#111113] border-card-border text-text-secondary hover:border-accent-blue/40'}`}
                                >
                                    {survey.interests.includes(domain) && <Check className="w-3 h-3 mx-auto mb-1" />}
                                    {domain}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button variant="ghost" onClick={() => setStep(1)} className="h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest">
                                Back
                            </Button>
                            <Button
                                disabled={survey.interests.length === 0}
                                onClick={() => setStep(3)}
                                className="h-14 px-12 talvix-gradient text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl gap-3"
                            >
                                Lock Domains <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 3: Mission Config ── */}
                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-12 max-w-xl mx-auto">
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl font-bold text-text-primary uppercase tracking-tight">Mission Setup</h2>
                            <p className="text-sm font-medium text-text-secondary">Set your target objectives to personalize your journey.</p>
                        </div>

                        <Card className="p-10 space-y-8 bg-white dark:bg-[#111113] border-none shadow-premium rounded-[2.5rem]">
                            {type !== 'STUDENT' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-2">Target Company</label>
                                        <Input
                                            placeholder="e.g. Google, Microsoft, Stripe..."
                                            value={survey.target_company}
                                            onChange={(e) => setSurvey({ ...survey, target_company: e.target.value })}
                                            className="h-14 bg-slate-50 dark:bg-slate-900 border-card-border rounded-xl font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-2">Target Role</label>
                                        <Input
                                            placeholder="e.g. Frontend Engineer, Data Scientist..."
                                            value={survey.target_role}
                                            onChange={(e) => setSurvey({ ...survey, target_role: e.target.value })}
                                            className="h-14 bg-slate-50 dark:bg-slate-900 border-card-border rounded-xl font-bold"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-2">Target Interview / Assessment Date</label>
                                <Input
                                    type="date"
                                    value={survey.interview_date}
                                    onChange={(e) => setSurvey({ ...survey, interview_date: e.target.value })}
                                    className="h-14 bg-slate-50 dark:bg-slate-900 border-card-border rounded-xl font-bold"
                                />
                            </div>
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => type === 'STUDENT' ? setStep(2) : setStep(1)}
                                className="flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-widest border-2 border-card-border"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleStep3Next}
                                disabled={loadingQuestions}
                                className="flex-[2] h-16 talvix-gradient text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl shadow-blue-500/20 gap-3"
                            >
                                {loadingQuestions
                                    ? <><Loader2 className="animate-spin w-5 h-5" /> Generating Questions...</>
                                    : isStudent
                                        ? <><Zap className="w-5 h-5" /> Start Quick Tech Check</>
                                        : <><ArrowRight className="w-5 h-5" /> Continue</>}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 4: Dynamic Tech Check MCQ ── */}
                {step === 4 && questions.length > 0 && (
                    <motion.div key={`step4-q${qIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="max-w-2xl mx-auto space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-text-primary uppercase tracking-tight">Quick Tech Check</h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Question {qIndex + 1} of {questions.length}</p>
                            </div>
                            <div className="p-3 bg-accent-blue/5 text-accent-blue rounded-xl border border-accent-blue/10">
                                <Brain className="w-6 h-6" />
                            </div>
                        </div>

                        <Card className="p-10 relative overflow-hidden bg-white dark:bg-[#111113] border-none shadow-premium rounded-[3rem]">
                            {/* Progress bar */}
                            <div className="absolute top-0 left-0 h-1.5 talvix-gradient transition-all duration-700 rounded-t-[3rem]"
                                style={{ width: `${((qIndex) / questions.length) * 100}%` }} />

                            <div className="space-y-8">
                                <div className="space-y-3 pt-2">
                                    <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-900 text-text-muted border border-card-border rounded-lg text-[9px] font-bold tracking-widest uppercase">
                                        {type === 'STUDENT' ? 'Domain & CS Fundamentals' : 'Engineering Competency'}
                                    </span>
                                    <h2 className="text-xl font-bold text-text-primary leading-snug tracking-tight">
                                        {questions[qIndex]?.question}
                                    </h2>
                                </div>

                                <div className="grid gap-3">
                                    {(questions[qIndex]?.options ?? []).map((opt: any, i: number) => {
                                        const optText = typeof opt === 'string' ? opt : String(opt);
                                        const isSelected = selectedAnswer === i;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswer(i)}
                                                className={`w-full p-5 text-left rounded-2xl border-2 transition-all font-semibold text-sm flex items-center gap-4 group
                                                    ${isSelected
                                                        ? 'border-accent-blue bg-accent-blue/5 text-accent-blue'
                                                        : 'border-card-border dark:border-slate-800 hover:border-accent-blue/40 hover:bg-accent-blue/5 text-text-secondary'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center text-[10px] font-black transition-all
                                                    ${isSelected ? 'border-accent-blue bg-accent-blue text-white' : 'border-slate-200 dark:border-slate-700 text-text-muted'}`}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className="flex-1">{optText}</span>
                                                {isSelected && <Check className="w-4 h-4 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>

                        <div className="flex gap-4">
                            <div className="flex-1 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3 text-amber-600 dark:text-amber-400 items-start">
                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold uppercase tracking-wide leading-relaxed">
                                    Your answers help us tailor a roadmap to your exact knowledge level.
                                </p>
                            </div>
                            <Button
                                onClick={handleNext}
                                disabled={selectedAnswer === null}
                                className="h-auto px-8 talvix-gradient text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 gap-2 flex-shrink-0"
                            >
                                {qIndex < questions.length - 1 ? <><ChevronRight className="w-5 h-5" /> Next</> : <><Check className="w-5 h-5" /> Finish</>}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 4: Loading questions state ── */}
                {step === 4 && questions.length === 0 && (
                    <motion.div key="step4-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 py-32">
                        <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
                        <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Generating questions...</p>
                    </motion.div>
                )}

                {/* ── STEP 5: Final Config ── */}
                {step === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto text-center space-y-12 py-10">
                        <div className="relative mx-auto w-fit">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }}
                                className="w-28 h-28 talvix-gradient rounded-[2.5rem] flex items-center justify-center text-white shadow-3xl shadow-blue-500/30">
                                <CheckCircle2 className="w-14 h-14" />
                            </motion.div>
                            <div className="absolute -top-3 -right-3 w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-xl border border-card-border">
                                <span className="text-xs font-bold text-text-primary font-outfit">Ready</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl font-bold text-text-primary tracking-tight uppercase">Almost There!</h2>
                            <p className="text-sm font-medium text-text-secondary leading-relaxed">
                                {answers.length > 0
                                    ? `You answered ${answers.filter((a, i) => a === questions[i]?.correct_answer_index).length}/${questions.length} correctly. Personalizing your roadmap.`
                                    : 'Set your final preferences and launch your dashboard.'}
                            </p>
                        </div>

                        {/* Selected domains summary for students */}
                        {type === 'STUDENT' && survey.interests.length > 0 && (
                            <div className="p-6 rounded-2xl text-left space-y-3" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Your Selected Domains</p>
                                <div className="flex flex-wrap gap-2">
                                    {survey.interests.map(d => (
                                        <span key={d} className="px-3 py-1.5 rounded-lg text-xs font-bold talvix-gradient text-white">
                                            {d}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Card className="p-10 space-y-10 bg-white dark:bg-[#111113] border-none shadow-premium rounded-[3rem]">
                            <div className="space-y-4 text-left px-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Preparation Duration</label>
                                <div className="grid grid-cols-4 gap-4">
                                    {[4, 8, 12, 16].map(w => (
                                        <button
                                            key={w}
                                            onClick={() => setSurvey({ ...survey, prep_duration: w })}
                                            className={`p-4 rounded-xl border-2 font-bold transition-all text-sm
                                                ${survey.prep_duration === w
                                                    ? 'border-accent-blue bg-accent-blue/5 text-accent-blue'
                                                    : 'border-card-border bg-slate-50 dark:bg-slate-900 text-text-muted hover:border-accent-blue/20'}`}
                                        >
                                            {w}w
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 text-left px-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Weekly Commitment</label>
                                <select
                                    className="w-full h-14 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-card-border text-text-primary font-bold text-sm outline-none focus:border-accent-blue/40 transition-all cursor-pointer"
                                    value={survey.weekly_commitment}
                                    onChange={(e) => setSurvey({ ...survey, weekly_commitment: parseInt(e.target.value) })}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''} / week</option>)}
                                </select>
                            </div>
                        </Card>

                        <Button
                            onClick={submitOnboarding}
                            disabled={loading}
                            className="w-full h-16 talvix-gradient text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-2xl shadow-blue-500/20 flex gap-4"
                        >
                            {loading ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : <><Rocket className="w-5 h-5" /> Launch Dashboard</>}
                        </Button>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}

/* ── Client-side fallback questions (used if network fails) ── */
const FALLBACK_QUESTIONS = [
    { question: "Which data structure uses LIFO (Last In, First Out) order?", options: ["Queue", "Stack", "Heap", "Linked List"], correct_answer_index: 1 },
    { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correct_answer_index: 0 },
    { question: "Which of these is NOT a programming language?", options: ["Python", "JavaScript", "HTML", "Rust"], correct_answer_index: 2 },
    { question: "What is the time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correct_answer_index: 2 },
    { question: "Which HTTP method is typically used to retrieve data?", options: ["POST", "PUT", "DELETE", "GET"], correct_answer_index: 3 },
];
