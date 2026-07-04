import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-slate-50 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] focus:ring-blue-500 border border-blue-500',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-700 focus:ring-slate-700',
    outline: 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 focus:ring-slate-700',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 focus:ring-red-500',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-slate-50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500 focus:ring-emerald-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
