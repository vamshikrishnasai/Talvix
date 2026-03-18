import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'premium';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
    className,
    variant = 'primary',
    size = 'md',
    style,
    ...props
}: ButtonProps) => {

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-8 py-4 text-base',
    };

    // Build inline styles for dark-mode-safe variants
    const variantStyle: React.CSSProperties = (() => {
        switch (variant) {
            case 'secondary':
                return { background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' };
            case 'outline':
                return { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--card-border)' };
            case 'ghost':
                return { background: 'transparent', color: 'var(--text-secondary)', border: 'none' };
            case 'premium':
            case 'primary':
            default:
                return {};
        }
    })();

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95',
                sizeClasses[size],
                // Only apply talvix-gradient via class for primary/premium
                (variant === 'primary' || variant === 'premium') && !className?.includes('bg-') && 'talvix-gradient text-white',
                className
            )}
            style={{ ...variantStyle, ...style }}
            {...props}
        />
    );
};
