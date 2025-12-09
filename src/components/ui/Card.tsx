import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 ${className}`}>
            {title && <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-sky-500 rounded-full inline-block"></span>
                {title}
            </h3>}
            {children}
        </div>
    );
};
