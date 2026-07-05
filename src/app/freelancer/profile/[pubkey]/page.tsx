'use client';

import { useEffect, useState } from 'react';
import { Horizon } from '@stellar/stellar-sdk';
import { useParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';

export default function FreelancerProfile() {
  const params = useParams();
  const pubkey = params.pubkey as string;
  const [profileJobs, setProfileJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      if (!pubkey) return;
      try {
        setLoading(true);
        
        // 1. Fetch off-chain jobs from backend
        let offChainJobs: any[] = [];
        try {
          const res = await fetch(`http://localhost:4000/jobs/freelancers/${pubkey}`);
          if (res.ok) {
            const data = await res.json();
            offChainJobs = data.jobsTaken || [];
          }
        } catch (e) {
          console.error('Failed to fetch off-chain data', e);
        }

        // 2. Fetch on-chain history
        const server = new Horizon.Server('https://horizon-testnet.stellar.org');
        const response = await server.transactions().forAccount(pubkey).order('desc').limit(50).call();
        const jobTransactions = response.records.filter(
          (tx: any) => tx.memo_type === 'text' && tx.memo && tx.memo.startsWith('JOB-')
        );

        // 3. Merge data
        const mergedJobs = offChainJobs.map((job: any) => {
          const shortId = job.id.slice(0, 20);
          const tx = jobTransactions.find((t: any) => t.memo.replace('JOB-', '') === shortId);
          return {
            ...job,
            verifiedTx: tx
          };
        });


        setProfileJobs(mergedJobs);
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load verified portfolio.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [pubkey]);

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400 text-lg">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'opacity-100' : 'opacity-20 text-slate-500'}>★</span>
        ))}
      </div>
    );
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
          <h2 className="text-2xl font-bold text-white">Portfolio & Reviews</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="w-8 h-8 animate-spin mb-4 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Scanning Stellar Ledger & Backend Data...</p>
          </div>
        ) : error ? (
          <Card className="bg-red-950/20 border-red-900/50">
            <p className="text-red-400 text-center">{error}</p>
          </Card>
        ) : profileJobs.length === 0 ? (
          <Card className="bg-slate-900/50 text-center py-12">
            <div className="text-slate-500 mb-2">No completed jobs found.</div>
            <p className="text-sm text-slate-600">Complete jobs to build an immutable reputation.</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {profileJobs.map((job) => (
              <Card key={job.id} className="bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{job.title || 'Unknown Job'}</h3>
                    {job.description && (
                      <p className="text-sm text-slate-400 max-w-xl">{job.description}</p>
                    )}
                  </div>
                  {job.verifiedTx && (
                    <div className="flex items-start">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800 rounded-full">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-emerald-400">Verified On-Chain</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          {new Date(job.verifiedTx.created_at).toLocaleDateString(undefined, { 
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {job.clientRating && (
                  <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(job.clientRating)}
                      <span className="text-sm font-bold text-slate-300">Client Rating</span>
                    </div>
                    {job.clientReview && (
                      <p className="text-sm text-slate-300 italic">"{job.clientReview}"</p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
