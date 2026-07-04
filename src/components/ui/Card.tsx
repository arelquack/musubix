import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col ${className}`}>
      {children}
    </div>
  );
}
