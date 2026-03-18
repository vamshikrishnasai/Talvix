"use client"

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Settings,
    Bell,
    Shield,
    Smartphone,
    LogOut,
    User,
    Lock,
    Save,
    Loader2,
    Eye,
    EyeOff,
    Target,
    MapPin,
    Briefcase,
    Building2,
    ShieldCheck,
    Brain,
    X,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/api/auth/me');
                setUser(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/api/auth/profile', {
                full_name: user.full_name,
                target_role: user.target_role,
                target_company: user.target_company
            });
            alert("Settings saved successfully.");
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Settings...</p>
        </div>
    );

    return (
        <div className="max-w-[1000px] mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-500">
            {/* simple Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 border-none">Settings</h1>
                    <p className="text-slate-500 font-medium">Update your profile info and mission goals.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-8 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 gap-2 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                </Button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Profile Information Section */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="p-10 border-slate-200 bg-white shadow-sm space-y-8 rounded-[2.5rem]">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                            <User className="w-5 h-5 text-blue-600" /> Profile Info
                        </h3>
                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.full_name || ''}
                                        onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2 opacity-60 grayscale scale-95 pointer-events-none">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        className="w-full px-6 py-4 bg-slate-100 border border-slate-100 rounded-2xl font-semibold text-slate-500 shadow-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Role</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={user?.target_role || ''}
                                            onChange={(e) => setUser({ ...user, target_role: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Company</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={user?.target_company || ''}
                                            onChange={(e) => setUser({ ...user, target_company: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-10 border-slate-200 bg-white shadow-sm space-y-8 rounded-[2.5rem]">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Security
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:border-blue-100 cursor-pointer">
                                <div>
                                    <p className="font-bold text-slate-900">Change Password</p>
                                    <p className="text-xs text-slate-400 font-medium">Reset your account passphrase.</p>
                                </div>
                                <Shield className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:border-emerald-100 cursor-pointer">
                                <div>
                                    <p className="font-bold text-slate-900">2FA Verification</p>
                                    <p className="text-xs text-slate-400 font-medium font-bold">Recommended for account security.</p>
                                </div>
                                <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-bold uppercase rounded-full border border-green-100">Enabled</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Controls Section */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-8 border-slate-200 bg-white shadow-sm space-y-6 rounded-[2.5rem]">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Bell className="w-4 h-4" /> Notifications
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Interview Alerts', enabled: true },
                                { label: 'Roadmap Updates', enabled: true },
                                { label: 'AI Coach Tips', enabled: false }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                                    <div className={`w-10 h-6 rounded-full relative transition-all duration-300 cursor-pointer ${item.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${item.enabled ? 'left-5' : 'left-1'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-8 border-slate-200 bg-white shadow-sm space-y-6 rounded-[2.5rem]">
                        <Button
                            onClick={() => { localStorage.clear(); window.location.href = '/auth/login'; }}
                            variant="ghost"
                            className="w-full h-12 text-red-500 font-bold gap-3 border-2 border-dashed border-red-50 hover:bg-red-50 transition-all rounded-xl text-xs uppercase tracking-widest"
                        >
                            <LogOut className="w-4 h-4" /> Logout Session
                        </Button>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-4">
                            Talvix Core v3.0.1
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
