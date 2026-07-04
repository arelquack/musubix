'use client';
import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ClientDashboard() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', budgetAmount: '' });
  const [processingJob, setProcessingJob] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:4000/jobs?clientId=mock-client-id');
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      console.error('Failed to fetch jobs', e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:4000/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, clientId: 'mock-client-id' }),
      });
      setShowForm(false);
      setFormData({ title: '', description: '', budgetAmount: '' });
      fetchJobs();
    } catch (e) {
      console.error('Failed to post job', e);
    }
  };

  const handleAction = async (jobId: string, action: string) => {
    if (action === 'approve') setProcessingJob(jobId);
    try {
      await fetch(`http://localhost:4000/jobs/${jobId}/${action}`, {
        method: 'POST',
      });
      fetchJobs();
    } catch (e) {
      console.error(`Failed to ${action} job`, e);
    } finally {
      if (action === 'approve') setProcessingJob(null);
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

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Client Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage your posted jobs and create new ones.</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Post New Job'}
        </Button>
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
                  <Button variant="primary" size="sm" onClick={() => handleAction(job.id, 'lock')}>Lock Escrow</Button>
                )}
                {job.status === 'LOCKED' && (
                  <span className="text-xs text-purple-400 font-medium">Funds Locked 🔒</span>
                )}
                {job.status === 'IN_REVIEW' && (
                  <Button 
                    variant="success" 
                    size="sm" 
                    onClick={() => handleAction(job.id, 'approve')}
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
