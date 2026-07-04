'use client';
import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function FreelancerDashboard() {
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:4000/jobs');
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      console.error('Failed to fetch jobs', e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand">Freelancer Dashboard</h1>
        <p className="text-slate-500 mt-2">Find micro-tasks and start earning instantly.</p>
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
              <div className="flex justify-between items-center">
                <span className="font-medium text-brand">{job.budgetAmount} {job.currency}</span>
                <Button variant="primary" size="sm">Accept Job</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </PageWrapper>
  );
}
