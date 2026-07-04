'use client';
import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWeb3 } from '@/components/Web3Provider';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { Contract, nativeToScVal, TransactionBuilder, rpc, xdr } from '@stellar/stellar-sdk';
import { server, TESTNET_NETWORK_PASSPHRASE, TESTNET_NATIVE_TOKEN, ESCROW_CONTRACT_ID } from '@/lib/soroban';

export default function ClientDashboard() {
  const { address, balance, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const [jobs, setJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', budgetAmount: '' });
  const [processingJob, setProcessingJob] = useState<string | null>(null);

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
    try {
      await fetch('http://localhost:4000/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, clientPubKey: address }),
      });
      setShowForm(false);
      setFormData({ title: '', description: '', budgetAmount: '' });
      fetchJobs();
    } catch (e) {
      console.error('Failed to post job', e);
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
        if (!res.ok) throw new Error('Backend failed to deploy escrow contract');
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
      await handleSorobanTx(jobId, contractId || ESCROW_CONTRACT_ID, 'approve_and_pay', 'COMPLETED', [
        new Contract(TESTNET_NATIVE_TOKEN).address().toScVal()
      ]);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-slate-800 text-slate-300';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400';
      case 'LOCKED': return 'bg-purple-500/10 text-purple-400';
      case 'IN_REVIEW': return 'bg-amber-500/10 text-amber-400';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400';
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
          <h1 className="text-3xl font-bold text-slate-50">Client Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage your posted jobs and create new ones.</p>
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
                <span className="text-xs text-slate-400">Testnet Balance</span>
                <span className="text-sm font-bold text-blue-400">{balance ? parseFloat(balance).toFixed(2) : '0'} XLM</span>
              </div>
              <button onClick={disconnectWallet} className="ml-4 text-xs text-red-400 hover:text-red-300 transition-colors">
                Disconnect
              </button>
            </div>
          )}
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel Posting' : 'Post New Job'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Job Title</label>
              <input required type="text" className="w-full bg-slate-950 border border-slate-800 text-slate-50 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea required className="w-full bg-slate-950 border border-slate-800 text-slate-50 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Budget (XLM)</label>
              <input required type="number" className="w-full bg-slate-950 border border-slate-800 text-slate-50 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2" value={formData.budgetAmount} onChange={(e) => setFormData({...formData, budgetAmount: e.target.value})} />
            </div>
            <Button type="submit" variant="success" className="self-start">Submit Job</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!Array.isArray(jobs) ? (
          <p className="text-red-500">Error loading jobs from server. Is the backend running?</p>
        ) : jobs.length === 0 ? (
          <p className="text-slate-500">No jobs posted yet.</p>
        ) : (
          jobs.map((job: any) => (
            <Card key={job.id}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-slate-50">{job.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(job.status)}`}>{job.status}</span>
              </div>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{job.description}</p>
              
              {job.status === 'IN_REVIEW' && job.workSubmission && (
                <div className="mb-4 p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Freelancer Submission:</span>
                  <p className="text-sm text-slate-300 mt-1 break-all">{job.workSubmission}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-auto">
                <span className="font-medium text-slate-200">{job.budgetAmount} {job.currency}</span>
                
                {job.status === 'OPEN' && (
                  <span className="text-xs text-slate-500">Waiting for freelancer...</span>
                )}
                {job.status === 'IN_PROGRESS' && (
                  <Button variant="primary" size="sm" onClick={() => handleAction(job.id, 'lock', job.escrowId)}>Lock Escrow</Button>
                )}
                {job.status === 'LOCKED' && (
                  <span className="text-xs text-purple-400 font-medium">Funds Locked 🔒</span>
                )}
                {job.status === 'IN_REVIEW' && (
                  <Button 
                    variant="success" 
                    size="sm" 
                    onClick={() => handleAction(job.id, 'approve', job.escrowId)}
                    disabled={processingJob === job.id}
                  >
                    {processingJob === job.id ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Web3 Payment...
                      </span>
                    ) : (
                      'Approve & Pay'
                    )}
                  </Button>
                )}
                {job.status === 'COMPLETED' && (
                  <span className="text-xs text-emerald-400 font-bold">PAID ✓</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </PageWrapper>
  );
}
