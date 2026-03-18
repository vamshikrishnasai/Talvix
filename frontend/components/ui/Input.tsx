"use client"

import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, className, type, ...props }: InputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="space-y-2">
            {label && <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">{label}</label>}
            <div className="relative group">
                <input
                    type={inputType}
                    className={cn(
                        'flex h-12 w-full rounded-2xl border border-card-border bg-card-bg px-5 py-3 text-sm text-text-primary transition-all placeholder:text-text-muted focus:outline-none focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue disabled:cursor-not-allowed disabled:opacity-50 group-hover:border-text-muted/30',
                        error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500',
                        className
                    )}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {error && <p className="text-xs font-bold text-red-500 ml-1">{error}</p>}
        </div>
    );
};
