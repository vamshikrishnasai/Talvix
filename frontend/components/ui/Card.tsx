import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    glass?: boolean;
}

export const Card = ({ children, className, glass = false, ...props }: CardProps) => {
    return (
        <div
            className={cn(
                'rounded-2xl transition-all duration-200',
                className
            )}
            style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('mb-4', className)}>{children}</div>
);

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 className={cn('text-xl font-semibold', className)} style={{ color: 'var(--text-primary)' }}>{children}</h3>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('', className)}>{children}</div>
);
