import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function FreelancerDashboard() {
  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand">Freelancer Dashboard</h1>
        <p className="text-slate-500 mt-2">Find micro-tasks and start earning instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for Available Jobs */}
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg text-brand">Design Logo</h3>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">OPEN</span>
          </div>
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">Need a modern logo for my Web3 project. Fast turnaround preferred.</p>
          <div className="flex justify-between items-center">
            <span className="font-medium text-brand">50 USDC</span>
            <Button variant="primary" size="sm">Accept Job</Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
