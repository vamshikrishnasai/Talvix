"use client"

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative flex items-center p-2 rounded-xl transition-all duration-200"
            style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-blue)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--card-border)';
            }}
        >
            <motion.div
                key={theme}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
            >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </motion.div>
        </button>
    );
}
