'use client';
import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useWeb3 } from '@/components/Web3Provider';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { TransactionBuilder, Operation, Asset, Memo } from '@stellar/stellar-sdk';
import { server, TESTNET_NETWORK_PASSPHRASE } from '@/lib/soroban';

export default function FreelancerDashboard() {
  const { address, balance, idrBalance, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const [jobs, setJobs] = useState<any[]>([]);
  const [submissionData, setSubmissionData] = useState<{ [key: string]: string }>({});
  const [activeFilter, setActiveFilter] = useState('all');

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
    if (!address) return alert('Connect wallet first.');
    if (!treasuryPubKey) return alert('Treasury not ready. Please refresh.');
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

      const { signedTxXdr } = await StellarWalletsKit.signTransaction(tx.toXDR(), { 
        networkPassphrase: TESTNET_NETWORK_PASSPHRASE, 
        address 
      });

      const txRecord = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, TESTNET_NETWORK_PASSPHRASE) as any);
      
      if (txRecord.status === 'ERROR') {
        throw new Error('Transaction submission failed');
      }

      await fetch(`http://localhost:4000/jobs/${jobId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'WITHDRAWN' }),
      });
      fetchJobs();
      alert('Withdrawal Successful! You have received IDR.');
    } catch (e: any) {
      console.error(e);
      alert('Withdrawal Failed: ' + e.message);
    } finally {
      setProcessingJob(null);
    }
  };

  const [isTransferringToBank, setIsTransferringToBank] = useState(false);

  const handleTransferToBank = async () => {
    if (!address) return alert('Connect wallet first.');
    if (!treasuryPubKey) return alert('Treasury not ready. Please refresh.');
    if (!idrBalance || parseFloat(idrBalance) <= 0) return alert('No IDR balance to transfer.');
    
    const bankAccount = window.prompt("Enter your Bank Account Number (e.g., BCA, Mandiri) to receive Fiat IDR:");
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

      const { signedTxXdr } = await StellarWalletsKit.signTransaction(tx.toXDR(), { 
        networkPassphrase: TESTNET_NETWORK_PASSPHRASE, 
        address 
      });

      const txRecord = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, TESTNET_NETWORK_PASSPHRASE) as any);
      
      if (txRecord.status === 'ERROR') {
        throw new Error('Transaction submission failed');
      }

      alert(`Transfer Initiated! ${idrBalance} IDR is being wired to your bank account: ${bankAccount}\n\n(For this demo, your crypto IDR was burned back to the Treasury)`);
      setTimeout(() => {
        window.location.reload(); 
      }, 2000);
    } catch (e: any) {
      console.error(e);
      alert('Transfer Failed: ' + e.message);
    } finally {
      setIsTransferringToBank(false);
    }
  };

  const handleAction = async (jobId: string, action: string, payload: any = {}) => {
    if (!address) {
      alert('Please connect your Web3 wallet first.');
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
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
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
            {!address && (
               <button className="btn btn-primary" onClick={connectWallet} disabled={isConnecting}>
                 {isConnecting ? 'Connecting...' : 'Connect wallet'}
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
                <span className="label">Balance</span>
                <span className="value">{balance ? parseFloat(balance).toFixed(2) : '0'} XLM</span>
              </div>
              <div className="wallet-field">
                <span className="label">Fiat Balance</span>
                <span className="value" style={{ color: 'var(--matsu)' }}>{idrBalance ? parseFloat(idrBalance).toFixed(2) : '0'} IDR</span>
              </div>
              <div className="wallet-actions">
                <button className="btn btn-ghost btn-small" onClick={handleTransferToBank} disabled={isTransferringToBank}>
                  {isTransferringToBank ? 'Transferring...' : 'Transfer to Bank'}
                </button>
                <button className="btn-danger-text" onClick={disconnectWallet}>Disconnect</button>
              </div>
            </div>
          )}
        </div>

        <div className="job-toolbar">
          <button className={`chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Jobs</button>
          <button className={`chip ${activeFilter === 'OPEN' ? 'active' : ''}`} onClick={() => setActiveFilter('OPEN')}>Open</button>
          <button className={`chip ${activeFilter === 'IN_PROGRESS' || activeFilter === 'LOCKED' ? 'active' : ''}`} onClick={() => setActiveFilter('IN_PROGRESS')}>Active</button>
          <button className={`chip ${activeFilter === 'COMPLETED' || activeFilter === 'WITHDRAWN' ? 'active' : ''}`} onClick={() => setActiveFilter('COMPLETED')}>Completed</button>
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
                <p className="desc">{job.description}</p>
                
                {job.aiScore !== null && job.aiScore !== undefined && (
                  <div style={{ padding: '12px', borderRadius: 'var(--radius-s)', border: '1px solid', backgroundColor: job.aiScore >= 80 ? 'rgba(92,138,110,0.1)' : job.aiScore >= 60 ? 'rgba(201,162,75,0.1)' : 'rgba(200,73,60,0.08)', borderColor: job.aiScore >= 80 ? 'var(--matsu)' : job.aiScore >= 60 ? 'var(--kin)' : 'var(--shu)', marginTop: '4px' }}>
                    {job.aiScore >= 80 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--matsu)' }}>
                        ✅ AI Score: {job.aiScore}/100 - Good Job Specs
                      </div>
                    ) : job.aiScore >= 60 ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--kin)', marginBottom: '4px' }}>
                          ⚠️ AI Score: {job.aiScore}/100 - Average Job Specs
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-1)' }}>{job.aiFeedback}</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--shu)', marginBottom: '4px' }}>
                          🚨 AI Warning (Score: {job.aiScore}/100) - Underpriced / Poor Specs
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-1)' }}>{job.aiFeedback}</p>
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
                        onClick={() => handleWithdraw(job.id, job.budgetAmount.toString())}
                        disabled={processingJob === job.id}
                      >
                        {processingJob === job.id ? 'Processing Swap...' : 'Withdraw to IDR (Bank)'}
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
      </div>
    </PageWrapper>
  );
}
