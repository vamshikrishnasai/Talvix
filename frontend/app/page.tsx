"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, FileText, Target, Zap, Brain, BookOpen, Library,
  BarChart3, Cpu, CheckCircle, ChevronLeft, ChevronRight,
  Dna, Search, TrendingUp, Users, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

const features = [
  { title: "Resume Intelligence", desc: "Deep NLP extraction identifies core skills from your resume with high accuracy.", icon: FileText, color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  { title: "JD Synergist", desc: "AI-powered job description matching to detect skill gaps instantly.", icon: Target, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  { title: "Smart Roadmaps", desc: "Custom, time-bound study plans tailored to your specific career goals.", icon: Zap, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { title: "AI Career Coach", desc: "Personalized mentorship and interview guidance, available 24/7.", icon: Brain, color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  { title: "Laboratories", desc: "Hands-on practice modules and skills assessments to validate knowledge.", icon: BookOpen, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  { title: "Interview Simulation", desc: "Mock interviews with generative AI to build confidence and technique.", icon: Cpu, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  { title: "Resource Library", desc: "Curated, high-quality learning materials for every technical domain.", icon: Library, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
  { title: "Performance Analytics", desc: "Visual tracking of preparation progress and readiness scores.", icon: BarChart3, color: '#f43f5e', bg: 'rgba(244,63,94,0.08)' },
];

const stats = [
  { value: '98.4%', label: 'Accuracy Rate' },
  { value: '50k+', label: 'Profiles Analyzed' },
  { value: '12k+', label: 'Mock Interviews' },
  { value: '99.9%', label: 'Uptime' },
];

const techPoints = [
  { title: 'NLP Resume Parsing', desc: 'Automated extraction of skills, projects, and experience from any format.', icon: Dna },
  { title: 'Market Gap Analysis', desc: 'Live comparison of your profile against thousands of job descriptions.', icon: Search },
  { title: 'AI Interview Mastery', desc: 'Realistic mock interviews powered by generative AI models.', icon: Cpu },
  { title: 'Growth Tracking', desc: 'Visual performance analytics to keep you on the right path.', icon: TrendingUp },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const totalSlides = Math.ceil(features.length / 3);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % totalSlides), 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          background: isScrolled ? 'var(--card-bg)' : 'transparent',
          borderBottom: isScrolled ? '1px solid var(--card-border)' : '1px solid transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/talvix_logo.png" alt="Talvix" className="h-9 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <button className="hidden sm:block px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}>
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="px-5 py-2 rounded-xl text-sm font-semibold text-white talvix-gradient transition-all active:scale-95"
                style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))' }} />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
                style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--accent-blue)', border: '1px solid rgba(37,99,235,0.15)' }}>
                <Star size={12} className="fill-current" /> AI-Powered Career Intelligence Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9]"
              style={{ color: 'var(--text-primary)' }}
            >
              Land your{' '}
              <span className="talvix-gradient-text">dream job</span>
              {' '}faster.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Talvix uses advanced AI to analyze your resume, identify skill gaps, build custom roadmaps, and simulate real interviews — so you walk in prepared.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/auth/signup">
                <button className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white talvix-gradient transition-all active:scale-95 hover:shadow-xl"
                  style={{ boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
                  Start for Free <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/auth/login">
                <button className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all"
                  style={{ border: '1px solid var(--card-border)', color: 'var(--text-secondary)', background: 'var(--card-bg)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-blue)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--card-border)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  }}>
                  Sign In
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t"
              style={{ borderColor: 'var(--card-border)' }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Feature Carousel ── */}
        <section className="py-24 px-6" style={{ background: 'var(--card-bg)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--accent-blue)' }}>Everything you need</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  A complete career platform.
                </h2>
                <p className="text-base font-medium max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  Eight powerful modules integrated into a single high-performance dashboard.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)}
                    className="transition-all rounded-full"
                    style={{
                      width: i === currentSlide ? '24px' : '8px',
                      height: '8px',
                      background: i === currentSlide ? 'var(--accent-blue)' : 'var(--card-border)'
                    }} />
                ))}
                <button onClick={() => setCurrentSlide(p => (p - 1 + totalSlides) % totalSlides)}
                  className="ml-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ border: '1px solid var(--card-border)', color: 'var(--text-secondary)', background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-blue)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--card-border)'}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrentSlide(p => (p + 1) % totalSlides)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ border: '1px solid var(--card-border)', color: 'var(--text-secondary)', background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-blue)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--card-border)'}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide}
                  initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="grid md:grid-cols-3 gap-5"
                >
                  {features.slice(currentSlide * 3, currentSlide * 3 + 3).map((f, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="p-7 rounded-2xl group cursor-default space-y-5 transition-all"
                      style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = f.color + '40';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                        style={{ background: f.bg, color: f.color }}>
                        <f.icon size={22} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: f.color }}>
                        Explore <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--accent-blue)' }}>How Talvix works</p>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                    Intelligence-first career architecture.
                  </h2>
                  <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    We don't just list jobs. We analyze your DNA, identify your gaps, and give you a personalized roadmap to close them.
                  </p>
                </div>
                <div className="space-y-5">
                  {techPoints.map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(37,99,235,0.06)', color: 'var(--accent-blue)', border: '1px solid rgba(37,99,235,0.1)' }}>
                        <item.icon size={18} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual panel */}
              <div className="relative">
                <div className="absolute -inset-8 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))' }} />
                <div className="relative p-6 rounded-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                  <div className="aspect-video rounded-xl talvix-gradient flex flex-col items-center justify-center gap-5 relative overflow-hidden p-8">
                    <div className="absolute inset-0 opacity-10">
                      <div className="grid grid-cols-6 grid-rows-4 gap-2 h-full p-4">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <motion.div key={i}
                            className="rounded bg-white"
                            animate={{ opacity: [0.2, 0.8, 0.2] }}
                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }} />
                        ))}
                      </div>
                    </div>
                    <div className="relative z-10 text-center">
                      <Zap className="w-16 h-16 text-white mx-auto mb-3" />
                      <p className="text-white font-black text-xl tracking-tight">Talvix Intelligence</p>
                      <p className="text-blue-100 text-sm mt-1 font-medium">AI Career Engine v2.0</p>
                    </div>
                    {/* Score display */}
                    <div className="relative z-10 flex gap-4">
                      {[['ATS', '92%'], ['Match', '88%'], ['Ready', '78%']].map(([l, v]) => (
                        <div key={l} className="px-3 py-2 bg-white/15 rounded-xl text-center backdrop-blur-sm">
                          <p className="text-white font-black text-base">{v}</p>
                          <p className="text-blue-100 text-[9px] font-bold uppercase tracking-widest">{l}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Pills below */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['Resume AI', 'Gap Analysis', 'Smart Roadmap', 'Mock Interviews', 'AI Coach'].map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--background)', color: 'var(--text-secondary)', border: '1px solid var(--card-border)' }}>
                        <CheckCircle size={11} className="inline mr-1.5" style={{ color: '#22c55e' }} />{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-12 rounded-3xl talvix-gradient text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl translate-x-1/2 translate-y-1/2" />
              </div>
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready to land your dream job?</h2>
                <p className="text-blue-100 text-base font-medium max-w-xl mx-auto">
                  Join thousands of professionals using Talvix to stand out and get hired faster.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/auth/signup">
                    <button className="px-8 py-3.5 rounded-xl text-sm font-bold bg-white transition-all active:scale-95 flex items-center gap-2"
                      style={{ color: 'var(--accent-blue)' }}>
                      Get Started Free <ArrowRight size={16} />
                    </button>
                  </Link>
                  <Link href="/auth/login">
                    <button className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 border border-white/30 hover:bg-white/10">
                      Sign In
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-12 px-6" style={{ borderTop: '1px solid var(--card-border)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <img src="/talvix_logo.png" alt="Talvix" className="h-9 w-auto" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2026 Talvix Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <Link key={link} href="#" className="text-sm font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-blue)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'}>
                {link}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
