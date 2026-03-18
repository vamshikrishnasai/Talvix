"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Video, Mic, MessageSquare, Play, RefreshCw, Star, Info } from 'lucide-react';

export default function MockInterviewPage() {
    const [step, setStep] = useState(0); // 0: Start, 1: Selection, 2: Interview

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-outfit">AI Mock Interview</h1>
                <p className="text-slate-500 mt-1">Practice with behavioral and technical questions</p>
            </div>

            {step === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <Card className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                            <Video className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">AI Face-to-Face</h3>
                        <p className="text-slate-500 mb-8">Record your answers via camera and microphone. Our AI will analyze your body language and tone.</p>
                        <Button variant="premium" className="w-full h-12" onClick={() => setStep(1)}>Start Recording Mode</Button>
                    </Card>

                    <Card className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Text-Based Practice</h3>
                        <p className="text-slate-500 mb-8">Quickly practice your technical explanations via text. Get instant feedback on your answers.</p>
                        <Button variant="outline" className="w-full h-12" onClick={() => setStep(1)}>Start Chat Mode</Button>
                    </Card>
                </div>
            ) : (
                <Card className="overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Live Session: Software Engineer</span>
                        </div>
                        <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> 12:45
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                            <div className="flex-1 bg-black aspect-video flex items-center justify-center relative">
                                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white border border-white/20 text-xs">
                                    <Mic className="w-3 h-3 text-green-500" /> Mic: Active
                                </div>
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 border-4 border-blue-400">
                                        AI
                                    </div>
                                    <p className="text-white/80 text-sm italic">"Can you explain how you would optimize a slow SQL query?"</p>
                                </div>
                            </div>

                            <div className="w-full md:w-80 border-l p-6 flex flex-col bg-white">
                                <h4 className="font-bold text-sm mb-4">Interview Suggestions</h4>
                                <div className="space-y-4">
                                    <div className="p-3 bg-blue-50 rounded-lg flex gap-3 text-xs text-blue-800">
                                        <Info className="w-4 h-4 shrink-0" />
                                        <p>Try to mention indexing, execution plans, and normalization during your answer.</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-lg flex gap-3 text-xs text-amber-800">
                                        <Star className="w-4 h-4 shrink-0" />
                                        <p>Confidence Tip: Maintain eye contact with the camera while speaking.</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 space-y-3">
                                    <Button variant="primary" className="w-full h-12">Submit Answer</Button>
                                    <Button variant="ghost" className="w-full" onClick={() => setStep(0)}>End Session</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="mt-12">
                <h3 className="text-xl font-bold mb-6">Recent Performance</h3>
                <div className="space-y-4">
                    {[
                        { role: 'Frontend Engineer', date: 'Yesterday', score: 4.5, feedback: 'Strong technical knowledge, but work on behavioral STAR method.' },
                        { role: 'Backend Developer', date: '3 days ago', score: 3.8, feedback: 'Explain data structures more clearly. Use real-world examples.' },
                    ].map((perf, i) => (
                        <Card key={i} className="hover:bg-slate-50 transition-colors">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{perf.role}</p>
                                        <p className="text-xs text-slate-500">{perf.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                        <Star className="w-4 h-4 fill-amber-500" /> {perf.score}
                                    </div>
                                    <Button variant="outline" size="sm">View Feedback</Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
