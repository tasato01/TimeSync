import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading,
    className = '',
    ...props
}) => {
    const baseStyle = "px-6 py-2 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-blue-500/30 shadow-lg",
        secondary: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30",
        ghost: "text-slate-500 hover:bg-slate-100/50"
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span> : children}
        </button>
    );
};
