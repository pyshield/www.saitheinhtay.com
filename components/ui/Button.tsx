import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    children, 
    ...props 
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
        primary: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/20 border border-transparent",
        secondary: "bg-white dark:bg-dark-muted border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-card hover:border-indigo-500/50",
        danger: "bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-transparent",
        ghost: "hover:bg-gray-100 dark:hover:bg-dark-muted text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};