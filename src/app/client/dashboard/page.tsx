'use client';
import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ClientDashboard() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', budgetAmount: '' });

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
    try {
      await fetch(`http://localhost:4000/jobs/${jobId}/${action}`, {
        method: 'POST',
      });
      fetchJobs();
    } catch (e) {
      console.error(`Failed to ${action} job`, e);
    }
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand">Client Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage your posted jobs and create new ones.</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Post New Job'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-brand mb-1">Job Title</label>
              <input required type="text" className="w-full border rounded-lg p-2" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand mb-1">Description</label>
              <textarea required className="w-full border rounded-lg p-2" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand mb-1">Budget (USDC)</label>
              <input required type="number" className="w-full border rounded-lg p-2" value={formData.budgetAmount} onChange={(e) => setFormData({...formData, budgetAmount: e.target.value})} />
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
                <h3 className="font-semibold text-lg text-brand">{job.title}</h3>
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">{job.status}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{job.description}</p>
              
              {job.status === 'IN_REVIEW' && job.workSubmission && (
                <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Freelancer Submission:</span>
                  <p className="text-sm text-slate-700 mt-1 break-all">{job.workSubmission}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-auto">
                <span className="font-medium text-brand">{job.budgetAmount} {job.currency}</span>
                
                {job.status === 'OPEN' && (
                  <span className="text-xs text-slate-400">Waiting for freelancer...</span>
                )}
                {job.status === 'IN_PROGRESS' && (
                  <Button variant="primary" size="sm" onClick={() => handleAction(job.id, 'lock')}>Lock Escrow</Button>
                )}
                {job.status === 'LOCKED' && (
                  <span className="text-xs text-brand font-medium">Funds Locked 🔒</span>
                )}
                {job.status === 'IN_REVIEW' && (
                  <Button variant="success" size="sm" onClick={() => handleAction(job.id, 'approve')}>Approve & Pay</Button>
                )}
                {job.status === 'COMPLETED' && (
                  <span className="text-xs text-emerald-600 font-bold">PAID ✓</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </PageWrapper>
  );
}
