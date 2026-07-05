'use client';

import { useEffect, useState } from 'react';
import { Horizon } from '@stellar/stellar-sdk';
import { useParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';

export default function FreelancerProfile() {
  const params = useParams();
  const pubkey = params.pubkey as string;
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!pubkey) return;
      try {
        setLoading(true);
        const server = new Horizon.Server('https://horizon-testnet.stellar.org');
        const response = await server.transactions().forAccount(pubkey).order('desc').limit(50).call();
        
        // Filter transactions with memo type 'text' and memo starting with 'JOB-'
        const jobTransactions = response.records.filter(
          (tx: any) => tx.memo_type === 'text' && tx.memo && tx.memo.startsWith('JOB-')
        );
        
        setTransactions(jobTransactions);
      } catch (err: any) {
        console.error('Failed to fetch on-chain history:', err);
        setError('Failed to load on-chain verified portfolio. Please ensure the address is correct.');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [pubkey]);

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto pt-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-3">Freelancer Profile</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-slate-300 font-mono">{truncateAddress(pubkey)}</span>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-white">On-Chain Verified Portfolio</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="w-8 h-8 animate-spin mb-4 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Scanning Stellar Ledger...</p>
          </div>
        ) : error ? (
          <Card className="bg-red-950/20 border-red-900/50">
            <p className="text-red-400 text-center">{error}</p>
          </Card>
        ) : transactions.length === 0 ? (
          <Card className="bg-slate-900/50 text-center py-12">
            <div className="text-slate-500 mb-2">No verified jobs found on-chain.</div>
            <p className="text-sm text-slate-600">Complete jobs to build an immutable reputation.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {transactions.map((tx) => (
              <Card key={tx.id} className="bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      {new Date(tx.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-lg font-bold text-white">
                      Job ID: <span className="font-mono text-blue-300">{tx.memo.replace('JOB-', '')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800 rounded-full shrink-0">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-emerald-400">Verified On-Chain</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
