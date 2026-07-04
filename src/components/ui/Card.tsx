import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
      {children}
    </div>
  );
}
