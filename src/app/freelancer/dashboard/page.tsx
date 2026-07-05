'use client';
import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { useWeb3 } from '@/components/Web3Provider';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { TransactionBuilder, Operation, Asset, Memo } from '@stellar/stellar-sdk';
import { server, TESTNET_NETWORK_PASSPHRASE } from '@/lib/soroban';

export default function FreelancerDashboard() {
  const { address, balance, idrBalance, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const [jobs, setJobs] = useState<any[]>([]);
  const [submissionData, setSubmissionData] = useState<{ [key: string]: string }>({});

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
      // For MVP, we fetch OPEN jobs, and jobs assigned to this freelancer
      const resOpen = await fetch('http://localhost:4000/jobs?status=OPEN');
      const openJobs = await resOpen.json();

      let myJobs: any[] = [];
      if (address) {
        const resMine = await fetch(`http://localhost:4000/jobs?freelancerPubKey=${address}`);
        myJobs = await resMine.json();
      }
      
      if (Array.isArray(openJobs) && Array.isArray(myJobs)) {
        // Deduplicate in case a job is somehow both (shouldn't happen)
        const all = [...myJobs, ...openJobs];
        const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
        setJobs(unique);
      } else {
        setJobs({ error: true } as any); // trigger the !Array.isArray check
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
          destination: treasuryPubKey, // Sending it back to the platform treasury
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-slate-800 text-slate-300';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400';
      case 'LOCKED': return 'bg-purple-500/10 text-purple-400';
      case 'IN_REVIEW': return 'bg-amber-500/10 text-amber-400';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400';
      case 'WITHDRAWN': return 'bg-indigo-500/10 text-indigo-400';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Freelancer Dashboard</h1>
          <p className="text-slate-400 mt-2">Find available jobs and track your active projects.</p>
        </div>
        <div className="flex items-center gap-4">
          {!address ? (
            <Button variant="primary" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Web3 Wallet'}
            </Button>
          ) : (
            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 py-2 px-4 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Connected Wallet</span>
                <span className="text-sm font-medium text-slate-200">{formatAddress(address)}</span>
              </div>
              <div className="h-8 w-px bg-slate-800 mx-2"></div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Balances</span>
                <span className="text-sm font-bold text-blue-400">{balance ? parseFloat(balance).toFixed(2) : '0'} XLM</span>
                <span className="text-sm font-bold text-green-400">{idrBalance ? parseFloat(idrBalance).toFixed(2) : '0'} IDR</span>
              </div>
              <button 
                onClick={handleTransferToBank} 
                disabled={isTransferringToBank}
                className="ml-2 text-xs text-green-400 hover:text-green-300 transition-colors border border-green-900 px-2 py-1 rounded"
              >
                {isTransferringToBank ? 'Transferring...' : 'Transfer to Bank'}
              </button>
              <button onClick={disconnectWallet} className="ml-2 text-xs text-red-400 hover:text-red-300 transition-colors">
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!Array.isArray(jobs) ? (
          <p className="text-red-500">Error loading jobs from server. Is the backend running?</p>
        ) : jobs.length === 0 ? (
          <p className="text-slate-500">No open jobs available at the moment.</p>
        ) : (
          jobs.map((job: any) => (
            <Card key={job.id}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-slate-50">{job.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(job.status)}`}>{job.status}</span>
              </div>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{job.description}</p>
              
              {job.status === 'LOCKED' && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter Github URL or text..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-50 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2 text-sm mb-2"
                    value={submissionData[job.id] || ''}
                    onChange={(e) => setSubmissionData({ ...submissionData, [job.id]: e.target.value })}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAction(job.id, 'submit', { workSubmission: submissionData[job.id] })}
                  >
                    Submit Work
                  </Button>
                </div>
              )}

              <div className="flex flex-col mt-auto">
                <span className="font-medium text-slate-200">{job.budgetAmount} {job.currency}</span>
                {xlmToIdrRate && job.currency === 'XLM' && (
                  <span className="text-xs text-green-400 font-semibold mt-1">
                    ≈ {(parseFloat(job.budgetAmount) * xlmToIdrRate).toLocaleString('id-ID')} IDR
                  </span>
                )}
              </div>
              
              <div className="flex justify-end items-center mt-4">
                {job.status === 'OPEN' && (
                  <Button variant="outline" size="sm" onClick={() => handleAction(job.id, 'accept')}>Accept Job</Button>
                )}
                {job.status === 'IN_PROGRESS' && (
                  <span className="text-xs text-slate-500">Waiting for Client Escrow...</span>
                )}
                {job.status === 'IN_REVIEW' && (
                  <span className="text-xs text-slate-300 font-medium">Pending Client Approval</span>
                )}
                {job.status === 'COMPLETED' && (
                  <Button 
                    variant="success" 
                    size="sm" 
                    onClick={() => handleWithdraw(job.id, job.budgetAmount.toString())}
                    disabled={processingJob === job.id}
                  >
                    {processingJob === job.id ? 'Processing Swap...' : 'Withdraw to IDR (Bank)'}
                  </Button>
                )}
                {job.status === 'WITHDRAWN' && (
                  <span className="text-xs text-blue-400 font-bold">FUNDS WITHDRAWN ✓</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </PageWrapper>
  );
}
