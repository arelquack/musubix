'use client';
import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useWeb3 } from '@/components/Web3Provider';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { Contract, nativeToScVal, TransactionBuilder, rpc } from '@stellar/stellar-sdk';
import { server, TESTNET_NETWORK_PASSPHRASE, TESTNET_NATIVE_TOKEN, ESCROW_CONTRACT_ID } from '@/lib/soroban';
import Link from 'next/link';

export default function ClientDashboard() {
  const { address, balance, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const [jobs, setJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', budgetAmount: '' });
  const [processingJob, setProcessingJob] = useState<string | null>(null);
  const [usdToXlmRate, setUsdToXlmRate] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{score: number, feedback: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ratingModal, setRatingModal] = useState<{jobId: string, escrowId: string} | null>(null);
  const [ratingData, setRatingData] = useState({ rating: 5, review: '' });

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd')
      .then(res => res.json())
      .then(data => {
        if (data?.stellar?.usd) {
          setUsdToXlmRate(1 / data.stellar.usd);
        }
      })
      .catch(console.error);
  }, []);

  const fetchJobs = async () => {
    try {
      const url = address 
        ? `http://localhost:4000/jobs?clientPubKey=${address}`
        : 'http://localhost:4000/jobs';
      const res = await fetch(url);
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      console.error('Failed to fetch jobs', e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('Please connect your Web3 wallet first.');
      return;
    }
    if (!aiAnalysis) {
      alert('Please analyze your job specs with AI first before posting.');
      return;
    }
    if (aiAnalysis.score < 60) {
      const confirmPost = window.confirm(`Warning: Your job specs received a poor AI score (${aiAnalysis.score}/100) indicating it might be underpriced or unclear. Are you sure you want to post this anyway?`);
      if (!confirmPost) return;
    }

    try {
      const xlmAmount = usdToXlmRate 
        ? (parseFloat(formData.budgetAmount) * usdToXlmRate).toFixed(2)
        : formData.budgetAmount;

      await fetch('http://localhost:4000/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          budgetAmount: xlmAmount, 
          currency: 'XLM', 
          clientPubKey: address,
          aiScore: aiAnalysis?.score,
          aiFeedback: aiAnalysis?.feedback
        }),
      });
      setShowForm(false);
      setFormData({ title: '', description: '', budgetAmount: '' });
      setAiAnalysis(null);
      fetchJobs();
    } catch (e) {
      console.error('Failed to post job', e);
    }
  };

  const handleAnalyze = async () => {
    if (!formData.title || !formData.description || !formData.budgetAmount) {
      alert('Please fill out all fields before analyzing.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:4000/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          budget: formData.budgetAmount,
        }),
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (e) {
      console.error('Failed to analyze job', e);
      alert('Failed to analyze job specs with AI.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSorobanTx = async (jobId: string, contractId: string, functionName: string, successStatus: string, args: any[] = []) => {
    if (!address) {
      alert('Please connect your Web3 wallet first.');
      return;
    }
    setProcessingJob(jobId);
    try {
      const contract = new Contract(contractId);
      const sourceAccount = await server.getAccount(address);
      const tx = new TransactionBuilder(sourceAccount, { fee: '1000', networkPassphrase: TESTNET_NETWORK_PASSPHRASE })
        .addOperation(contract.call(functionName, ...args))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(preparedTx.toXDR(), { 
        networkPassphrase: TESTNET_NETWORK_PASSPHRASE, 
        address 
      });

      const txRecord = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, TESTNET_NETWORK_PASSPHRASE) as any);
      
      if (txRecord.status === 'ERROR') {
        throw new Error('Transaction submission failed');
      }

      // Poll for transaction success
      let status: any = rpc.Api.GetTransactionStatus.NOT_FOUND;
      while (status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const res = await server.getTransaction(txRecord.hash);
        status = res.status;
        if (status === rpc.Api.GetTransactionStatus.FAILED) throw new Error('Transaction execution failed on-chain');
        if (status === rpc.Api.GetTransactionStatus.SUCCESS) break;
      }

      // Sync backend status
      await fetch(`http://localhost:4000/jobs/${jobId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: successStatus }),
      });
      fetchJobs();
    } catch (e: any) {
      console.error(`Failed to execute ${functionName}:`, e);
      alert(`Transaction Failed: ${e.message}`);
    } finally {
      setProcessingJob(null);
    }
  };

  const handleAction = async (jobId: string, action: string, contractId?: string, job?: any) => {
    if (action === 'lock') {
      if (!address) {
        alert('Please connect your Web3 wallet first.');
        return;
      }
      setProcessingJob(jobId);
      try {
        const res = await fetch(`http://localhost:4000/jobs/${jobId}/lock`, { method: 'POST' });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Network Error: Failed to communicate with blockchain node. Please try again.');
        }
        const updatedJob = await res.json();
        
        // After backend initializes, frontend submits the init and deposit
        await handleSorobanTx(jobId, updatedJob.escrowId, 'initialize', 'IN_PROGRESS', [
          nativeToScVal(address, { type: 'address' }),
          nativeToScVal(updatedJob.freelancer.stellarPubKey, { type: 'address' }),
          nativeToScVal(updatedJob.budgetAmount * 10000000, { type: 'i128' }),
        ]);

        await handleSorobanTx(jobId, updatedJob.escrowId, 'deposit', 'LOCKED', [
          new Contract(TESTNET_NATIVE_TOKEN).address().toScVal()
        ]);
      } catch (e: any) {
        console.error('Lock flow failed:', e);
        alert(`Lock flow failed: ${e.message}`);
        setProcessingJob(null);
      }
      return;
    }
    if (action === 'approve') {
      setProcessingJob(jobId);
      try {
        const res = await fetch(`http://localhost:4000/jobs/${jobId}/approve`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: ratingData.rating, review: ratingData.review })
        });
        if (!res.ok) throw new Error('Backend approval failed');

        await handleSorobanTx(jobId, contractId!, 'approve_and_pay', 'COMPLETED', [
          new Contract(TESTNET_NATIVE_TOKEN).address().toScVal()
        ]);
        setRatingModal(null);
      } catch (e: any) {
        console.error('Approve flow failed:', e);
        alert(`Approve flow failed: ${e.message}`);
      } finally {
        setProcessingJob(null);
      }
      return;
    }

    setProcessingJob(jobId);
    try {
      await fetch(`http://localhost:4000/jobs/${jobId}/${action}`, {
        method: 'POST',
      });
      fetchJobs();
    } catch (e) {
      console.error(`Failed to ${action} job`, e);
    } finally {
      setProcessingJob(null);
    }
  };

  const [isToppingUp, setIsToppingUp] = useState(false);

  const handleTopUp = async () => {
    if (!address) return;
    setIsToppingUp(true);
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${address}`);
      const data = await res.json();
      
      if (!res.ok) {
        if (data.detail === 'account already funded to starting balance') {
          alert('Top up failed: Your account is already fully funded for testnet (10,000 XLM).');
        } else {
          alert(`Top up failed: ${data.detail || data.title || 'Unknown error'}`);
        }
      } else {
        alert('Top up successful! 10,000 testnet XLM has been added to your wallet.');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (e: any) {
      alert(`Top up error: ${e.message}`);
    } finally {
      setIsToppingUp(false);
    }
  };

  const getStatusStamp = (status: string) => {
    switch (status) {
      case 'OPEN': return 'stamp-open';
      case 'IN_PROGRESS': return 'stamp-submitted';
      case 'LOCKED': return 'stamp-escrow';
      case 'IN_REVIEW': return 'stamp-submitted';
      case 'COMPLETED': return 'stamp-matsu'; // We'll add this class later if needed, or use stamp-open
      case 'WITHDRAWN': return 'stamp-withdrawn';
      default: return 'stamp-escrow';
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  return (
    <PageWrapper>
      <div className="wrap">
        <div className="dash-header">
          <div className="dash-title-row">
            <div>
              <h1>Client Dashboard</h1>
              <p>Manage your posted jobs and create new ones.</p>
            </div>
            {!address ? (
               <button className="btn btn-primary" onClick={connectWallet} disabled={isConnecting}>
                 {isConnecting ? 'Connecting...' : 'Connect wallet'}
               </button>
            ) : (
               <button className="btn btn-ghost" onClick={() => {
                 setShowForm(!showForm);
                 setAiAnalysis(null);
               }}>
                 {showForm ? 'Cancel Posting' : 'Post New Job'}
               </button>
            )}
          </div>

          {address && (
            <div className="wallet-bar">
              <div className="wallet-field">
                <span className="label">Wallet Address</span>
                <span className="value address" onClick={() => navigator.clipboard.writeText(address)} title="Click to copy">{formatAddress(address)}</span>
              </div>
              <div className="wallet-divider"></div>
              <div className="wallet-field">
                <span className="label">Testnet Balance</span>
                <span className="value">{balance ? parseFloat(balance).toFixed(2) : '0'} XLM</span>
                {usdToXlmRate && balance && (
                  <span className="sub">≈ ${(parseFloat(balance) / usdToXlmRate).toFixed(2)} USD</span>
                )}
              </div>
              <div className="wallet-actions">
                <button className="btn btn-ghost btn-small" onClick={handleTopUp} disabled={isToppingUp}>
                  {isToppingUp ? 'Topping up...' : 'Top up 10k XLM'}
                </button>
                <button className="btn-danger-text" onClick={disconnectWallet}>Disconnect</button>
              </div>
            </div>
          )}
        </div>

        {showForm && (
          <div style={{ background: 'var(--ink-card)', padding: '32px', borderRadius: 'var(--radius-m)', border: '1px solid var(--ink-line)', marginBottom: '40px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', margin: '0 0 24px', fontWeight: 500 }}>Post a New Job</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600 }}>Job Title</label>
                <input required type="text" style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--ink-line)', color: 'var(--text-1)', borderRadius: 'var(--radius-s)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '15px' }} value={formData.title} onChange={(e) => {setFormData({...formData, title: e.target.value}); setAiAnalysis(null);}} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600 }}>Description</label>
                <textarea required style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--ink-line)', color: 'var(--text-1)', borderRadius: 'var(--radius-s)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '15px' }} rows={3} value={formData.description} onChange={(e) => {setFormData({...formData, description: e.target.value}); setAiAnalysis(null);}}></textarea>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600 }}>Budget (USD)</label>
                <input required type="number" style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--ink-line)', color: 'var(--text-1)', borderRadius: 'var(--radius-s)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '15px' }} value={formData.budgetAmount} onChange={(e) => {setFormData({...formData, budgetAmount: e.target.value}); setAiAnalysis(null);}} />
                {usdToXlmRate && formData.budgetAmount && (
                  <p style={{ fontSize: '12px', color: 'var(--kin)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                    ≈ {(parseFloat(formData.budgetAmount) * usdToXlmRate).toFixed(2)} XLM
                  </p>
                )}
              </div>
              
              {aiAnalysis && (
                <div style={{ padding: '16px', borderRadius: 'var(--radius-s)', border: '1px solid', backgroundColor: aiAnalysis.score >= 80 ? 'rgba(92,138,110,0.1)' : aiAnalysis.score >= 60 ? 'rgba(201,162,75,0.1)' : 'rgba(200,73,60,0.08)', borderColor: aiAnalysis.score >= 80 ? 'var(--matsu)' : aiAnalysis.score >= 60 ? 'var(--kin)' : 'var(--shu)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: aiAnalysis.score >= 80 ? 'var(--matsu)' : aiAnalysis.score >= 60 ? 'var(--kin)' : 'var(--shu)' }}>
                      {aiAnalysis.score}/100
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-2)' }}>
                      {aiAnalysis.score >= 80 ? 'Good Job Specs' : aiAnalysis.score >= 60 ? 'Average Job Specs' : 'Underpriced / Poor Specs'}
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-1)', margin: 0 }}>{aiAnalysis.feedback}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={handleAnalyze} disabled={isAnalyzing}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                </button>
                {aiAnalysis && (
                  <button type="submit" className="btn btn-primary" style={{ background: 'var(--matsu)' }}>
                    Confirm & Post Job
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="job-grid">
          {!Array.isArray(jobs) ? (
            <div className="empty-state">
              <h3>Connection Error</h3>
              <p>Error loading jobs from server. Is the backend running?</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs posted yet</h3>
              <p>When you post a job, it will appear here.</p>
            </div>
          ) : (
            jobs.map((job: any) => (
              <div className="job-card" key={job.id}>
                <div className="job-card-top">
                  <h3>{job.title}</h3>
                  <span className={`stamp ${getStatusStamp(job.status)}`}>{job.status}</span>
                </div>
                <p className="desc">{job.description}</p>
                
                {job.status === 'IN_REVIEW' && job.workSubmission && (
                  <div style={{ padding: '12px', background: 'var(--ink)', borderRadius: 'var(--radius-s)', border: '1px solid var(--ink-line)', marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Submission:</span>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-1)', margin: 0, wordBreak: 'break-all' }}>{job.workSubmission}</p>
                  </div>
                )}

                {job.freelancer?.stellarPubKey && (job.status === 'IN_PROGRESS' || job.status === 'IN_REVIEW' || job.status === 'COMPLETED' || job.status === 'WITHDRAWN') && (
                  <div>
                    <Link href={`/freelancer/profile/${job.freelancer.stellarPubKey}`} className="profile-link">
                      View Freelancer Profile
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                )}

                <div className="amount-row" style={{ flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span className="amount">{job.budgetAmount}</span>
                    <span className="amount-currency">{job.currency}</span>
                  </div>
                  
                  <div style={{ display: 'flex', width: '100%' }}>
                    {job.status === 'OPEN' && (
                      <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Waiting for freelancer...</span>
                    )}
                    {job.status === 'IN_PROGRESS' && (
                      <button className="btn btn-primary btn-small" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleAction(job.id, 'lock', job.escrowId)}>
                        Lock Escrow
                      </button>
                    )}
                    {job.status === 'LOCKED' && (
                      <span style={{ fontSize: '13px', color: 'var(--ai)', fontWeight: 600 }}>Funds Locked 🔒</span>
                    )}
                    {job.status === 'IN_REVIEW' && (
                      <button 
                        className="btn btn-primary btn-small" 
                        style={{ width: '100%', justifyContent: 'center', background: 'var(--matsu)' }}
                        onClick={() => setRatingModal({ jobId: job.id, escrowId: job.escrowId })}
                        disabled={processingJob === job.id}
                      >
                        {processingJob === job.id ? 'Processing...' : 'Approve & Pay'}
                      </button>
                    )}
                    {job.status === 'COMPLETED' && (
                      <span style={{ fontSize: '13px', color: 'var(--matsu)', fontWeight: 'bold' }}>PAID ✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {ratingModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ background: 'var(--ink-card)', padding: '32px', borderRadius: 'var(--radius-m)', border: '1px solid var(--ink-line)', width: '100%', maxWidth: '440px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', margin: '0 0 24px', fontWeight: 500 }}>Rate Freelancer</h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px', fontWeight: 600 }}>Star Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setRatingData({ ...ratingData, rating: star })}
                      style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: ratingData.rating >= star ? 'var(--kin)' : 'var(--ink-line)' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600 }}>Review (Optional)</label>
                <textarea 
                  style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--ink-line)', color: 'var(--text-1)', borderRadius: 'var(--radius-s)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '15px' }}
                  rows={3} 
                  placeholder="How was working with this freelancer?"
                  value={ratingData.review} 
                  onChange={(e) => setRatingData({...ratingData, review: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-ghost" onClick={() => setRatingModal(null)}>Cancel</button>
                <button 
                  className="btn btn-primary"
                  style={{ background: 'var(--matsu)' }}
                  disabled={processingJob === ratingModal.jobId}
                  onClick={() => handleAction(ratingModal.jobId, 'approve', ratingModal.escrowId)}
                >
                  {processingJob === ratingModal.jobId ? 'Processing...' : 'Submit & Pay'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
