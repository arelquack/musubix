import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <PageWrapper className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-brand tracking-tight">
          Welcome to <span className="text-primary">KerjaBounty</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          The borderless micro-freelance platform powered by Stellar. Secure escrow, instant cross-border path payments, and zero hidden fees.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/client/dashboard" passHref>
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-blue-500/30">
              I want to hire
            </Button>
          </Link>
          <Link href="/freelancer/dashboard" passHref>
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white">
              I want to work
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
        <Card className="hover:shadow-md transition-shadow border-t-4 border-t-primary">
          <h3 className="text-xl font-bold text-brand mb-2">Smart Escrow</h3>
          <p className="text-slate-600">
            Funds are locked in a Soroban smart contract, ensuring absolute trust and guaranteed payments upon approval.
          </p>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-t-4 border-t-emerald-500">
          <h3 className="text-xl font-bold text-brand mb-2">Auto-Conversion</h3>
          <p className="text-slate-600">
            Pay in USDC, receive in IDR. We handle real-time cross-border conversions at the best DEX rates seamlessly.
          </p>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-t-4 border-t-brand">
          <h3 className="text-xl font-bold text-brand mb-2">Micro-Task Ready</h3>
          <p className="text-slate-600">
            Designed specifically for quick, low-cost local tasks without the bloat of traditional enterprise freelance platforms.
          </p>
        </Card>
      </div>
    </PageWrapper>
  );
}
