"use client"

import React, { useState, useEffect, useRef } from 'react';
import {
    User, Mail, Briefcase, Globe, Edit3, Camera, Loader2,
    Target, Zap, Building2, Award, TrendingUp, Save, X,
    Github, Linkedin, Code2, Trophy, BookOpen, Link2, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const LABEL: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)'
};
const SURFACE: React.CSSProperties = {
    background: 'var(--background)', border: '1px solid var(--card-border)', borderRadius: '0.75rem'
};
const CARD: React.CSSProperties = {
    background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '1.25rem'
};

const SOCIAL_LINKS = [
    { key: 'linkedin_url', icon: Linkedin, label: 'LinkedIn', color: '#0077b5', placeholder: 'https://linkedin.com/in/yourname' },
    { key: 'github_url', icon: Github, label: 'GitHub', color: '#6e5494', placeholder: 'https://github.com/yourname' },
    { key: 'leetcode_url', icon: Code2, label: 'LeetCode', color: '#f59e0b', placeholder: 'https://leetcode.com/yourname' },
    { key: 'hackerrank_url', icon: Trophy, label: 'HackerRank', color: '#22c55e', placeholder: 'https://hackerrank.com/yourname' },
    { key: 'codechef_url', icon: BookOpen, label: 'CodeChef', color: '#8b4513', placeholder: 'https://codechef.com/yourname' },
    { key: 'medium_url', icon: Link2, label: 'Medium', color: '#000000', placeholder: 'https://medium.com/@yourname' },
    { key: 'stackoverflow_url', icon: Globe, label: 'Stack Overflow', color: '#f48024', placeholder: 'https://stackoverflow.com/users/id/yourname' },
];

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get('/api/auth/me');
            setUser(res.data);
            setEditForm(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/api/auth/me', editForm);
            setUser(editForm);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/api/auth/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser((prev: any) => ({ ...prev, photo_url: res.data.photo_url }));
        } catch (err) {
            // If upload endpoint doesn't exist, show preview locally
            const reader = new FileReader();
            reader.onloadend = () => setUser((prev: any) => ({ ...prev, photo_url: reader.result }));
            reader.readAsDataURL(file);
        } finally {
            setUploadingPhoto(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--accent-blue)' }} />
            <p style={LABEL}>Loading profile...</p>
        </div>
    );

    const initials = user?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
        <div className="max-w-[1100px] mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your professional identity and social presence.</p>
                </div>
                {isEditing ? (
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsEditing(false)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{ color: 'var(--text-muted)', background: 'var(--surface-hover)' }}>
                            <X size={16} /> Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white talvix-gradient transition-all active:scale-95"
                            style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{ color: 'var(--accent-blue)', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
                        <Edit3 size={16} /> Edit Profile
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Left: Avatar + Stats */}
                <div className="lg:col-span-4 space-y-5">

                    {/* Avatar card */}
                    <div className="p-8 text-center space-y-5" style={CARD}>
                        <div className="relative w-28 h-28 mx-auto">
                            {user?.photo_url ? (
                                <img src={user.photo_url} alt="Avatar"
                                    className="w-full h-full rounded-2xl object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-2xl talvix-gradient flex items-center justify-center text-white text-3xl font-black">
                                    {initials}
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95"
                                style={{ background: 'var(--accent-blue)' }}
                            >
                                {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </div>

                        <div>
                            {isEditing ? (
                                <input
                                    value={editForm.full_name || ''}
                                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full text-center text-lg font-bold outline-none px-3 py-1.5 rounded-xl border"
                                    style={{ background: 'var(--background)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                                />
                            ) : (
                                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.full_name}</h2>
                            )}
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 pt-1">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase"
                                style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--accent-blue)', border: '1px solid rgba(37,99,235,0.15)' }}>
                                {user?.user_type || 'Member'}
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase"
                                style={{ background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.15)' }}>
                                <CheckCircle2 size={10} className="inline mr-1" />Verified
                            </span>
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="p-6 talvix-gradient text-white rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap size={18} />
                            <span className="text-sm font-bold">Daily Streak</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-black">{user?.streak_count || 0}</span>
                            <span className="text-sm font-semibold text-blue-100 mb-1">days</span>
                        </div>
                        <p className="text-xs text-blue-100/80 mt-2 font-medium">Keep going — consistency wins interviews.</p>
                    </div>

                    {/* Knowledge score */}
                    <div className="p-6 rounded-2xl space-y-4" style={CARD}>
                        <div className="flex items-center justify-between">
                            <span style={LABEL}>Knowledge Score</span>
                            <span className="text-xl font-black" style={{ color: 'var(--accent-blue)' }}>
                                {Math.round(user?.knowledge_score || 0)}%
                            </span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${user?.knowledge_score || 0}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className="h-full talvix-gradient rounded-full"
                            />
                        </div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                            Based on test results and lab performance.
                        </p>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="lg:col-span-8 space-y-5">

                    {/* Career goals */}
                    <div className="p-6 rounded-2xl space-y-5" style={CARD}>
                        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Career Goals</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: Briefcase, label: 'Target Role', key: 'target_role', color: 'var(--accent-blue)' },
                                { icon: Building2, label: 'Target Company', key: 'target_company', color: '#6366f1' },
                            ].map((field) => (
                                <div key={field.key} className="p-4 rounded-xl space-y-2" style={SURFACE}>
                                    <p style={LABEL}>{field.label}</p>
                                    {isEditing ? (
                                        <input
                                            value={editForm[field.key] || ''}
                                            onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                                            className="w-full text-sm font-semibold outline-none bg-transparent"
                                            style={{ color: 'var(--text-primary)' }}
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: field.color + '12', color: field.color }}>
                                                <field.icon size={14} />
                                            </div>
                                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {user?.[field.key] || 'Not set'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="p-6 rounded-2xl space-y-5" style={CARD}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Social & Coding Profiles</h3>
                            {!isEditing && (
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click Edit Profile to add links</p>
                            )}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {SOCIAL_LINKS.map((social) => {
                                const val = isEditing ? editForm[social.key] : user?.[social.key];
                                return (
                                    <div key={social.key} className="flex items-center gap-3 p-3.5 rounded-xl transition-all" style={SURFACE}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: social.color + '12', color: social.color }}>
                                            <social.icon size={15} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p style={{ ...LABEL, fontSize: '9px' }}>{social.label}</p>
                                            {isEditing ? (
                                                <input
                                                    value={editForm[social.key] || ''}
                                                    onChange={e => setEditForm({ ...editForm, [social.key]: e.target.value })}
                                                    placeholder={social.placeholder}
                                                    className="text-xs w-full outline-none bg-transparent mt-0.5 font-medium truncate"
                                                    style={{ color: 'var(--text-primary)' }}
                                                />
                                            ) : val ? (
                                                <a href={val} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs font-medium truncate block hover:underline transition-all"
                                                    style={{ color: 'var(--accent-blue)' }}>
                                                    {val.replace(/^https?:\/\/(www\.)?/, '')}
                                                </a>
                                            ) : (
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Not linked</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { icon: Award, title: 'Skill Badges', desc: 'Certifications and earned recognition.', color: 'var(--accent-blue)', href: '/dashboard/performance' },
                            { icon: TrendingUp, title: 'Activity Log', desc: 'Learning history and session records.', color: '#22c55e', href: '/dashboard/performance' },
                        ].map((item, i) => (
                            <div key={i} className="p-5 rounded-2xl cursor-pointer group transition-all" style={CARD}
                                onClick={() => window.location.href = item.href}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = item.color + '40';
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)';
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                }}
                            >
                                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-all"
                                    style={{ background: item.color + '10', color: item.color }}>
                                    <item.icon size={20} />
                                </div>
                                <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                                <p className="text-xs mt-1 font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
