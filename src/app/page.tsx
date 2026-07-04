import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <PageWrapper>
      {/* Container utama untuk memaksa semuanya ke tengah */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto px-4">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-3xl space-y-6 w-full">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-50 tracking-tight w-full">
            Welcome to <span className="text-blue-500 drop-shadow-md">Musubix</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The borderless micro-freelance platform powered by Stellar. Secure escrow, instant cross-border path payments, and zero hidden fees.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 w-full">
            <Link href="/client/dashboard" passHref>
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all">
                I want to hire
              </Button>
            </Link>
            <Link href="/freelancer/dashboard" passHref>
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
                I want to work
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid (Tetap di bawah, lebar penuh) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
          <Card className="hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-shadow border-t-4 border-t-blue-500 bg-slate-900/50 backdrop-blur-sm border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-slate-50 mb-3">Smart Escrow</h3>
            <p className="text-slate-400 leading-relaxed">
              Funds are locked in a Soroban smart contract, ensuring absolute trust and guaranteed payments upon approval.
            </p>
          </Card>
          
          <Card className="hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-shadow border-t-4 border-t-emerald-500 bg-slate-900/50 backdrop-blur-sm border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-slate-50 mb-3">Auto-Conversion</h3>
            <p className="text-slate-400 leading-relaxed">
              Pay in XLM, receive in IDR. We handle real-time cross-border conversions at the best DEX rates seamlessly.
            </p>
          </Card>

          <Card className="hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-shadow border-t-4 border-t-amber-500 bg-slate-900/50 backdrop-blur-sm border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-slate-50 mb-3">Micro-Task Ready</h3>
            <p className="text-slate-400 leading-relaxed">
              Designed specifically for quick, low-cost local tasks without the bloat of traditional enterprise freelance platforms.
            </p>
          </Card>
        </div>

      </div>
    </PageWrapper>
  );
}