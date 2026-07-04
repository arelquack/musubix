import React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={`min-h-screen bg-slate-950 text-slate-50 ${inter.className}`}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
