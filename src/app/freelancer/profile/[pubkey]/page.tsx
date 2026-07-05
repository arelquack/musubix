'use client';

import { useEffect, useState } from 'react';
import { Horizon } from '@stellar/stellar-sdk';
import { useParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';

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

        const server = new Horizon.Server('https://horizon-testnet.stellar.org');
        const response = await server.transactions().forAccount(pubkey).order('desc').limit(50).call();
        const jobTransactions = response.records.filter(
          (tx: any) => tx.memo_type === 'text' && tx.memo && tx.memo.startsWith('JOB-')
        );

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

  return (
    <PageWrapper>
      <div className="wrap">
        <div className="dash-header">
          <div className="dash-title-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
            <h1 style={{ margin: 0 }}>Freelancer Profile</h1>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--ink-card)', border: '1px solid var(--ink-line)', borderRadius: '999px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--matsu)' }}></div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-1)' }}>{truncateAddress(pubkey)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--ink-line)', paddingBottom: '16px', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, margin: 0 }}>Portfolio & Reviews</h2>
        </div>

        {loading ? (
          <div className="empty-state" style={{ border: 'none' }}>
            <p style={{ color: 'var(--matsu)', fontWeight: 600 }}>Scanning Stellar Ledger & Backend Data...</p>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ borderColor: 'var(--shu)' }}>
            <p style={{ color: 'var(--shu)' }}>{error}</p>
          </div>
        ) : profileJobs.length === 0 ? (
          <div className="empty-state">
            <h3>No completed jobs found</h3>
            <p>Complete jobs to build an immutable reputation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '90px' }}>
            {profileJobs.map(job => (
              <div className="job-card" key={job.id} style={{ display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, margin: '0 0 8px' }}>{job.title || 'Unknown Job'}</h3>
                    {job.description && (
                      <p style={{ fontSize: '15px', color: 'var(--text-2)', margin: 0 }}>{job.description}</p>
                    )}
                  </div>
                  {job.verifiedTx && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                      <div className="stamp" style={{ color: 'var(--matsu)', background: 'rgba(92,138,110,0.1)', borderColor: 'currentColor' }}>
                        Verified On-Chain
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                        {new Date(job.verifiedTx.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                {job.clientRating && (
                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--ink-line-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', fontSize: '20px' }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{ color: i < job.clientRating ? 'var(--kin)' : 'var(--ink-line-soft)' }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)' }}>Client Rating</span>
                    </div>
                    {job.clientReview && (
                      <p style={{ fontSize: '14px', color: 'var(--text-2)', fontStyle: 'italic', margin: 0 }}>&quot;{job.clientReview}&quot;</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
