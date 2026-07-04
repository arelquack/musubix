'use client';
import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function FreelancerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [submissionData, setSubmissionData] = useState<{ [key: string]: string }>({});

  const fetchJobs = async () => {
    try {
      // For MVP, we fetch OPEN jobs, and jobs assigned to this freelancer
      const resOpen = await fetch('http://localhost:4000/jobs?status=OPEN');
      const resMine = await fetch('http://localhost:4000/jobs?freelancerId=mock-freelancer-id');
      const openJobs = await resOpen.json();
      const myJobs = await resMine.json();
      
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
  }, []);

  const handleAction = async (jobId: string, action: string, payload: any = {}) => {
    try {
      await fetch(`http://localhost:4000/jobs/${jobId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, freelancerId: 'mock-freelancer-id' }),
      });
      fetchJobs();
    } catch (e) {
      console.error(`Failed to ${action} job`, e);
    }
  };

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand">Freelancer Dashboard</h1>
        <p className="text-slate-500 mt-2">Find available jobs and track your active projects.</p>
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
                <h3 className="font-semibold text-lg text-brand">{job.title}</h3>
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">{job.status}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{job.description}</p>
              
              {job.status === 'LOCKED' && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter Github URL or text..."
                    className="w-full border rounded-lg p-2 text-sm mb-2"
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

              <div className="flex justify-between items-center mt-auto">
                <span className="font-medium text-brand">{job.budgetAmount} {job.currency}</span>
                
                {job.status === 'OPEN' && (
                  <Button variant="outline" size="sm" onClick={() => handleAction(job.id, 'accept')}>Accept Job</Button>
                )}
                {job.status === 'IN_PROGRESS' && (
                  <span className="text-xs text-slate-400">Waiting for Client Escrow...</span>
                )}
                {job.status === 'IN_REVIEW' && (
                  <span className="text-xs text-brand font-medium">Pending Client Approval</span>
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
