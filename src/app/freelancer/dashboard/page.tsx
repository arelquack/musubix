'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/components/AuthProvider';
import { TransactionBuilder, Operation, Asset, Memo } from '@stellar/stellar-sdk';
import { server, TESTNET_NETWORK_PASSPHRASE } from '@/lib/soroban';

export default function FreelancerDashboard() {
  const { user, balance, idrBalance, login, logout, isAuthenticating } = useAuth();
  const address = user?.stellarPubKey;
  const [jobs, setJobs] = useState<any[]>([]);
  const [submissionData, setSubmissionData] = useState<{ [key: string]: string }>({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [withdrawalModal, setWithdrawalModal] = useState<{job: any, step: number, bank: string, account: string} | null>(null);

  const [treasuryPubKey, setTreasuryPubKey] = useState<string | null>(null);
  const [processingJob, setProcessingJob] = useState<string | null>(null);
  const [xlmToIdrRate, setXlmToIdrRate] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/jobs/treasury')
      .then(res => res.json())
      .then(data => setTreasuryPubKey(data.issuerPubKey))
      .catch(console.error);

    fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=idr')
      .then(res => res.json())
      .then(data => {
        if (data?.stellar?.idr) {
          setXlmToIdrRate(data.stellar.idr);
        }
      })
      .catch(console.error);
  }, []);

  const fetchJobs = async () => {
    try {
      const resOpen = await fetch('http://localhost:4000/jobs?status=OPEN');
      const openJobs = await resOpen.json();

      let myJobs: any[] = [];
      if (address) {
        const resMine = await fetch(`http://localhost:4000/jobs?freelancerPubKey=${address}`);
        myJobs = await resMine.json();
      }
      
      if (Array.isArray(openJobs) && Array.isArray(myJobs)) {
        const all = [...myJobs, ...openJobs];
        const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
        setJobs(unique);
      } else {
        setJobs({ error: true } as any);
      }
    } catch (e) {
      console.error('Failed to fetch jobs', e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [address]);

  const handleWithdraw = async (jobId: string, amountXlm: string) => {
    if (!address) { alert('Please sign in or connect your account first.'); return false; }
    if (!treasuryPubKey) { alert('System not ready. Please refresh.'); return false; }
    setProcessingJob(jobId);
    try {
      const sourceAccount = await server.getAccount(address);
      const idrAsset = new Asset('IDR', treasuryPubKey);

      const tx = new TransactionBuilder(sourceAccount, { fee: '1000', networkPassphrase: TESTNET_NETWORK_PASSPHRASE })
        .addOperation(Operation.changeTrust({ asset: idrAsset }))
        .addOperation(Operation.pathPaymentStrictSend({
          sendAsset: Asset.native(),
          sendAmount: amountXlm,
          destination: address,
          destAsset: idrAsset,
          destMin: '0.0000001',
        }))
        .addMemo(Memo.text(`JOB-${jobId.slice(0, 20)}`))
        .setTimeout(30)
        .build();

      const signRes = await fetch('http://localhost:4000/sign-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id, xdr: tx.toXDR() })
      });
      if (!signRes.ok) throw new Error('Failed to sign transaction securely');
      const signedTxXdr = await signRes.text();

      const txRecord = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, TESTNET_NETWORK_PASSPHRASE) as any);
      
      if (txRecord.status === 'ERROR') {
        throw new Error('Secure payment submission failed');
      }

      // Sync backend status
      await fetch(`http://localhost:4000/jobs/${jobId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'WITHDRAWN' }),
      });
      fetchJobs();
      return true;
    } catch (e: any) {
      console.error(e);
      if (e.message && e.message.toLowerCase().includes('reject')) {
        alert('Authorization cancelled.');
      } else {
        alert('System Error: ' + e.message);
      }
      return false;
    } finally {
      setProcessingJob(null);
    }
  };

  const handleSimulateWithdrawal = () => {
    if (!withdrawalModal || !withdrawalModal.account) {
        alert('Please enter your account number.');
        return;
    }
    setWithdrawalModal({ ...withdrawalModal, step: 1 });
    setTimeout(() => {
      setWithdrawalModal(prev => prev ? { ...prev, step: 2 } : null);
      setTimeout(() => {
        const job = withdrawalModal.job;
        setWithdrawalModal(prev => prev ? { ...prev, step: 3 } : null);
        handleWithdraw(job.id, job.budgetAmount.toString())
          .then((success) => {
            if (success) setWithdrawalModal(prev => prev ? { ...prev, step: 4 } : null);
            else setWithdrawalModal(null);
          })
          .catch(() => {
            setWithdrawalModal(null);
          });
      }, 1500);
    }, 1500);
  };

  const [isTransferringToBank, setIsTransferringToBank] = useState(false);

  const handleTransferToBank = async () => {
    if (!address) return alert('Please sign in or connect your account first.');
    if (!treasuryPubKey) return alert('System not ready. Please refresh.');
    if (!idrBalance || parseFloat(idrBalance) <= 0) return alert('No balance to transfer.');
    
    const bankAccount = window.prompt("Enter your Bank Account Number (e.g., BCA, Mandiri) to receive your funds:");
    if (!bankAccount) return;

    setIsTransferringToBank(true);
    try {
      const sourceAccount = await server.getAccount(address);
      const idrAsset = new Asset('IDR', treasuryPubKey);

      const tx = new TransactionBuilder(sourceAccount, { fee: '1000', networkPassphrase: TESTNET_NETWORK_PASSPHRASE })
        .addOperation(Operation.payment({
          destination: treasuryPubKey,
          asset: idrAsset,
          amount: idrBalance,
        }))
        .setTimeout(30)
        .build();

      const signRes = await fetch('http://localhost:4000/sign-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id, xdr: tx.toXDR() })
      });
      if (!signRes.ok) throw new Error('Failed to sign transaction securely');
      const signedTxXdr = await signRes.text();

      const txRecord = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, TESTNET_NETWORK_PASSPHRASE) as any);
      
      if (txRecord.status === 'ERROR') {
        throw new Error('Secure payment submission failed');
      }

      alert(`Withdrawal processed successfully. ${idrBalance} IDR is on the way to your bank account: ${bankAccount}`);
      setTimeout(() => {
        window.location.reload(); 
      }, 2000);
    } catch (e: any) {
      console.error(e);
      alert('System Error: ' + e.message);
    } finally {
      setIsTransferringToBank(false);
    }
  };

  const handleAction = async (jobId: string, action: string, payload: any = {}) => {
    if (!address) {
      alert('Please sign in or connect your account first.');
      return;
    }
    setProcessingJob(jobId);
    try {
      await fetch(`http://localhost:4000/jobs/${jobId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, freelancerPubKey: address }),
      });
      fetchJobs();
    } catch (e) {
      console.error(`Failed to ${action} job`, e);
    } finally {
      setProcessingJob(null);
    }
  };

  const getStatusStamp = (status: string) => {
    switch (status) {
      case 'OPEN': return 'stamp-open';
      case 'IN_PROGRESS': return 'stamp-submitted';
      case 'LOCKED': return 'stamp-escrow';
      case 'IN_REVIEW': return 'stamp-submitted';
      case 'COMPLETED': return 'stamp-matsu'; // handled inline
      case 'WITHDRAWN': return 'stamp-withdrawn';
      default: return 'stamp-escrow';
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `User ID: ...${addr.slice(-4)}`;
  };

  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => activeFilter === 'all' || job.status === activeFilter) : [];

  return (
    <PageWrapper>
      <div className="wrap">
        <div className="dash-header">
          <div className="dash-title-row">
            <div>
              <h1>Freelancer Dashboard</h1>
              <p>Find available jobs and track your active projects.</p>
            </div>
            {!user && (
               <button className="btn btn-primary" onClick={() => {
                 const email = prompt('Enter your email to sign in: (e.g. freelancer@musubix.com)');
                 if (email) login(email);
               }} disabled={isAuthenticating}>
                 {isAuthenticating ? 'Signing In...' : 'Sign In / Connect Account'}
               </button>
            )}
          </div>

          {address && (
            <div className="wallet-bar">
              <div className="wallet-field">
                <span className="label">Account ID</span>
                <span className="value address" onClick={() => navigator.clipboard.writeText(address)} title="Click to copy">{formatAddress(address)}</span>
              </div>
              <div className="wallet-divider"></div>
              <div className="wallet-field">
                <span className="label">Available Balance</span>
                <span className="value" style={{ color: 'var(--matsu)' }}>{idrBalance ? parseFloat(idrBalance).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0'} IDR</span>
                {balance && (
                  <span className="sub">≈ {parseFloat(balance).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Credits (XLM)</span>
                )}
              </div>
              <div className="wallet-actions">
                <button className="btn btn-ghost btn-small" onClick={handleTransferToBank} disabled={isTransferringToBank}>
                  {isTransferringToBank ? 'Processing...' : 'Withdraw Balance'}
                </button>
                <button className="btn-danger-text" onClick={logout}>Sign Out</button>
              </div>
            </div>
          )}
        </div>

        <div className="job-toolbar">
          <button className={`chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Jobs</button>
          <button className={`chip ${activeFilter === 'OPEN' ? 'active' : ''}`} onClick={() => setActiveFilter('OPEN')}>Open</button>
          <button className={`chip ${activeFilter === 'IN_PROGRESS' ? 'active' : ''}`} onClick={() => setActiveFilter('IN_PROGRESS')}>In Progress</button>
          <button className={`chip ${activeFilter === 'LOCKED' ? 'active' : ''}`} onClick={() => setActiveFilter('LOCKED')}>Locked (Escrow)</button>
          <button className={`chip ${activeFilter === 'IN_REVIEW' ? 'active' : ''}`} onClick={() => setActiveFilter('IN_REVIEW')}>In Review</button>
          <button className={`chip ${activeFilter === 'COMPLETED' ? 'active' : ''}`} onClick={() => setActiveFilter('COMPLETED')}>Completed</button>
          <button className={`chip ${activeFilter === 'WITHDRAWN' ? 'active' : ''}`} onClick={() => setActiveFilter('WITHDRAWN')}>Withdrawn</button>
        </div>

        <div className="job-grid">
          {!Array.isArray(jobs) ? (
            <div className="empty-state">
              <h3>Connection Error</h3>
              <p>Error loading jobs from server. Is the backend running?</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs found</h3>
              <p>No jobs match this filter currently.</p>
            </div>
          ) : (
            filteredJobs.map((job: any) => (
              <div className="job-card" key={job.id}>
                <div className="job-card-top">
                  <h3>{job.title}</h3>
                  <span className={`stamp ${getStatusStamp(job.status)}`}>{job.status}</span>
                </div>
                <div className="desc">
                  {job.description && job.description.length > 140 ? (
                    <>
                      {job.description.slice(0, 140)}...{' '}
                      <Link href={`/jobs/${job.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>
                        Read more &rarr;
                      </Link>
                    </>
                  ) : (
                    job.description
                  )}
                </div>
                
                {job.aiScore !== null && job.aiScore !== undefined && (
                  <div style={{ padding: '12px', borderRadius: 'var(--radius-s)', border: '1px solid', backgroundColor: job.aiScore >= 80 ? 'rgba(16,185,129,0.08)' : job.aiScore >= 60 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)', borderColor: job.aiScore >= 80 ? '#10b981' : job.aiScore >= 60 ? '#f59e0b' : '#ef4444', marginTop: '4px' }}>
                    {job.aiScore >= 80 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#059669' }}>
                        <span style={{ fontWeight: 700 }}>AI Score:</span> {job.aiScore}/100 &middot; Verified Job Specs
                      </div>
                    ) : job.aiScore >= 60 ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#d97706', marginBottom: '4px' }}>
                          <span>AI Score:</span> {job.aiScore}/100 &middot; Moderate Job Specs
                        </div>
                        <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>{job.aiFeedback}</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>
                          <span>AI Assessment:</span> {job.aiScore}/100 &middot; Caution Required
                        </div>
                        <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>{job.aiFeedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {job.status === 'LOCKED' && (
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="text"
                      placeholder="Enter Github URL or text..."
                      style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--ink-line)', color: 'var(--text-1)', borderRadius: 'var(--radius-s)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '14px', marginBottom: '8px' }}
                      value={submissionData[job.id] || ''}
                      onChange={(e) => setSubmissionData({ ...submissionData, [job.id]: e.target.value })}
                    />
                    <button
                      className="btn btn-primary btn-small"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => handleAction(job.id, 'submit', { workSubmission: submissionData[job.id] })}
                    >
                      Submit Work
                    </button>
                  </div>
                )}

                <div className="amount-row" style={{ flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span className="amount">{job.budgetAmount}</span>
                      <span className="amount-currency">{job.currency}</span>
                    </div>
                    {xlmToIdrRate && job.currency === 'XLM' && (
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--matsu)', fontWeight: 600, marginTop: '2px' }}>
                        ≈ {(parseFloat(job.budgetAmount) * xlmToIdrRate).toLocaleString('id-ID')} IDR
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                    {job.status === 'OPEN' && (
                      <button className="btn btn-ghost btn-small" onClick={() => handleAction(job.id, 'accept')}>Accept Job</button>
                    )}
                    {job.status === 'IN_PROGRESS' && (
                      <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>Waiting for Client Escrow...</span>
                    )}
                    {job.status === 'IN_REVIEW' && (
                      <span style={{ fontSize: '12px', color: 'var(--text-1)', fontWeight: 600 }}>Pending Client Approval</span>
                    )}
                    {job.status === 'COMPLETED' && (
                      <button 
                        className="btn btn-primary btn-small" 
                        style={{ background: 'var(--matsu)' }}
                        onClick={() => setWithdrawalModal({ job, step: 0, bank: 'BCA', account: '' })}
                        disabled={processingJob === job.id}
                      >
                        {processingJob === job.id ? 'Processing...' : 'Transfer to Bank Account'}
                      </button>
                    )}
                    {job.status === 'WITHDRAWN' && (
                      <span style={{ fontSize: '12px', color: 'var(--ai)', fontWeight: 'bold' }}>FUNDS WITHDRAWN ✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {withdrawalModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
            <div style={{ background: 'var(--ink-card)', padding: '32px', borderRadius: 'var(--radius-m)', border: '1px solid var(--ink-line)', width: '100%', maxWidth: '400px' }}>
              
              {withdrawalModal.step === 0 && (
                <>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', margin: '0 0 24px', fontWeight: 500, textAlign: 'center' }}>Transfer to Bank</h3>
                  <div style={{ background: 'var(--ink)', padding: '16px', borderRadius: 'var(--radius-s)', border: '1px solid var(--ink-line-soft)', marginBottom: '20px' }}>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>Amount to Receive (IDR)</span>
                    <p style={{ margin: '8px 0 0', fontWeight: 'bold', fontSize: '24px', color: 'var(--matsu)' }}>
                       {xlmToIdrRate ? `Rp ${(parseFloat(withdrawalModal.job.budgetAmount) * xlmToIdrRate).toLocaleString('id-ID')}` : 'Calculating...'}
                    </p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600 }}>Select Destination Bank</label>
                    <select 
                      style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--ink-line)', color: 'var(--text-1)', borderRadius: 'var(--radius-s)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '15px' }}
                      value={withdrawalModal.bank}
                      onChange={(e) => setWithdrawalModal({...withdrawalModal, bank: e.target.value})}
                    >
                      <option value="BCA">BCA (Bank Central Asia)</option>
                      <option value="Mandiri">Bank Mandiri</option>
                      <option value="BNI">BNI (Bank Negara Indonesia)</option>
                      <option value="GoPay">GoPay (E-Wallet)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600 }}>Account Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1234567890"
                      style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--ink-line)', color: 'var(--text-1)', borderRadius: 'var(--radius-s)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '15px' }}
                      value={withdrawalModal.account}
                      onChange={(e) => setWithdrawalModal({...withdrawalModal, account: e.target.value})}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setWithdrawalModal(null)}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', background: 'var(--matsu)' }} onClick={handleSimulateWithdrawal}>Confirm Bank Transfer</button>
                  </div>
                </>
              )}

              {(withdrawalModal.step === 1 || withdrawalModal.step === 2 || withdrawalModal.step === 3) && (
                <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid var(--ink-line)', borderTopColor: 'var(--matsu)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
                  <p style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                    {withdrawalModal.step === 1 && 'Connecting to Bank Servers...'}
                    {withdrawalModal.step === 2 && 'Processing Transfer...'}
                    {withdrawalModal.step === 3 && 'Awaiting Secure System Authorization...'}
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {withdrawalModal.step === 4 && (
                <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                  <div style={{ width: '60px', height: '60px', background: 'rgba(92, 138, 110, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--matsu)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '30px', height: '30px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', margin: '0 0 12px', fontWeight: 500 }}>Transfer Successful!</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '14.5px', marginBottom: '24px' }}>
                    Funds have been successfully sent to your {withdrawalModal.bank} account.
                  </p>
                  
                  <div style={{ background: 'var(--ink)', padding: '16px', borderRadius: 'var(--radius-s)', border: '1px solid var(--ink-line-soft)', marginBottom: '24px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Ref ID</span>
                      <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>TRX-{Math.floor(Math.random()*1000000000)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Destination</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>{withdrawalModal.bank} - {withdrawalModal.account}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--ink-line-soft)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Amount Sent</span>
                      <span style={{ fontSize: '13px', color: 'var(--matsu)', fontWeight: 'bold' }}>
                        {xlmToIdrRate ? `Rp ${(parseFloat(withdrawalModal.job.budgetAmount) * xlmToIdrRate).toLocaleString('id-ID')}` : '-'}
                      </span>
                    </div>
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setWithdrawalModal(null)}>Done</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
