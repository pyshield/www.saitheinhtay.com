import React from 'react';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', actions }) => {
    return (
        <div className={`bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6 transition-all duration-200 hover:shadow-md ${className}`}>
            {(title || actions) && (
                <div className="flex justify-between items-center mb-6">
                    {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>}
                    {actions && <div>{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
};