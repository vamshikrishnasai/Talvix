"use client"

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Search as SearchIcon,
    Building2,
    Target,
    BookOpen,
    Loader2,
    ExternalLink,
    ArrowRight
} from 'lucide-react';
import api from '@/lib/api';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            performSearch();
        } else {
            setLoading(false);
        }
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            // Simplified search: returns companies, roles, and resources
            const res = await api.get(`/api/search?q=${query}`);
            setResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-500 font-medium">Searching across Talvix...</p>
        </div>
    );

    return (
        <div className="max-w-[1000px] mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-500">
            <div className="mt-4">
                <h1 className="text-3xl font-bold text-slate-900 border-none">Search Results</h1>
                <p className="text-slate-500 font-medium">Showing results for "{query}"</p>
            </div>

            {!results || (Object.values(results).every((arr: any) => !arr || arr.length === 0)) ? (
                <div className="py-20 text-center space-y-4">
                    <SearchIcon className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-medium italic">No results found for your search.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Companies */}
                    {results.companies?.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Companies</h3>
                            <div className="grid gap-4">
                                {results.companies.map((c: any, i: number) => (
                                    <Card key={i} className="p-6 bg-white border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center p-2">
                                                <img
                                                    src={`https://logo.clearbit.com/${c.name?.toLowerCase().replace(/\s+/g, '')}.com`}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                                <Building2 className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900 leading-none mb-1">{c.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{c.location || 'Technology'}</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => window.location.href = `/dashboard?company=${c.name}`}
                                            variant="ghost"
                                            className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform"
                                        >
                                            View Info <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resources */}
                    {results.resources?.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Topics & Resources</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {results.resources.map((r: any, i: number) => (
                                    <Card key={i} className="p-6 bg-white border-slate-200 hover:border-blue-400 transition-all group flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded-lg">{r.type}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{r.title}</h4>
                                        </div>
                                        <Button
                                            onClick={() => window.open(r.url, '_blank')}
                                            className="w-full mt-6 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white font-bold h-10 rounded-xl transition-all border border-slate-100"
                                        >
                                            Open <ExternalLink className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
