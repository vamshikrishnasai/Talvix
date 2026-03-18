"use client"

import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Layout, Database } from 'lucide-react';

const TECH_ITEMS = [
    { id: 'react', name: 'React', domain: 'frontend' },
    { id: 'express', name: 'Express', domain: 'backend' },
    { id: 'tailwind', name: 'Tailwind', domain: 'frontend' },
    { id: 'fastapi', name: 'FastAPI', domain: 'backend' },
    { id: 'postgres', name: 'PostgreSQL', domain: 'backend' },
    { id: 'framer', name: 'Framer Motion', domain: 'frontend' },
];

export default function OnboardingGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [items, setItems] = useState(TECH_ITEMS.sort(() => Math.random() - 0.5));
    const [frontend, setFrontend] = useState<any[]>([]);
    const [backend, setBackend] = useState<any[]>([]);
    const [finished, setFinished] = useState(false);

    const handleSort = (item: any, target: 'frontend' | 'backend') => {
        if (target === 'frontend') {
            setFrontend([...frontend, item]);
        } else {
            setBackend([...backend, item]);
        }
        setItems(items.filter(i => i.id !== item.id));
    };

    const checkResults = () => {
        let score = 0;
        frontend.forEach(item => { if (item.domain === 'frontend') score += 1; });
        backend.forEach(item => { if (item.domain === 'backend') score += 1; });
        setFinished(true);
        // Normalized to 100
        onComplete(Math.round((score / TECH_ITEMS.length) * 100));
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-outfit">Quick Tech Check</h2>
                <p className="text-slate-500">Categorize these technologies to test your command</p>
            </div>

            <div className="grid grid-cols-2 gap-8 h-64">
                <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 bg-blue-50/30 flex flex-col items-center">
                    <div className="flex items-center gap-2 text-blue-600 font-bold mb-4">
                        <Layout className="w-5 h-5" /> Frontend
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {frontend.map(item => (
                            <span key={item.id} className="bg-white px-3 py-1 rounded-full text-sm shadow-sm border">{item.name}</span>
                        ))}
                    </div>
                </div>

                <div className="border-2 border-dashed border-purple-200 rounded-2xl p-6 bg-purple-50/30 flex flex-col items-center">
                    <div className="flex items-center gap-2 text-purple-600 font-bold mb-4">
                        <Database className="w-5 h-5" /> Backend
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {backend.map(item => (
                            <span key={item.id} className="bg-white px-3 py-1 rounded-full text-sm shadow-sm border">{item.name}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
                {items.map(item => (
                    <motion.div
                        key={item.id}
                        layoutId={item.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm cursor-move flex items-center justify-between gap-4"
                    >
                        <span className="font-semibold">{item.name}</span>
                        <div className="flex gap-2">
                            <button onClick={() => handleSort(item, 'frontend')} className="p-1 hover:bg-blue-50 text-blue-500 rounded"><Layout className="w-4 h-4" /></button>
                            <button onClick={() => handleSort(item, 'backend')} className="p-1 hover:bg-purple-50 text-purple-500 rounded"><Database className="w-4 h-4" /></button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {items.length === 0 && !finished && (
                <div className="flex justify-center">
                    <Button onClick={checkResults} variant="premium" className="px-12 h-12">
                        Verify My Knowledge
                    </Button>
                </div>
            )}
        </div>
    );
}
