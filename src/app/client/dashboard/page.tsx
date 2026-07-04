import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ClientDashboard() {
  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand">Client Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage your posted jobs and create new ones.</p>
        </div>
        <Button variant="primary">Post New Job</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for Jobs */}
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg text-brand">Design Logo</h3>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">OPEN</span>
          </div>
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">Need a modern logo for my Web3 project. Fast turnaround preferred.</p>
          <div className="flex justify-between items-center">
            <span className="font-medium text-brand">50 USDC</span>
            <Button variant="outline" size="sm">View Details</Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
