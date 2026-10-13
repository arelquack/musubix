'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/components/AuthProvider';
import { 
  FiArrowLeft, 
  FiShield, 
  FiCheckCircle, 
  FiUser, 
  FiClock, 
  FiDollarSign, 
  FiShare2, 
  FiAlertCircle 
} from 'react-icons/fi';
import { SiStellar } from 'react-icons/si';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:4000/jobs/item/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Job not found');
        return res.json();
      })
      .then((data) => {
        setJob(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load project details');
        setLoading(false);
      });
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return { color: '#059669', bg: '#d1fae5', text: 'Open for Proposals' };
      case 'IN_PROGRESS': return { color: '#2563eb', bg: '#dbeafe', text: 'Work in Progress' };
      case 'LOCKED': return { color: '#7c3aed', bg: '#ede9fe', text: 'Escrow Locked' };
      case 'IN_REVIEW': return { color: '#d97706', bg: '#fef3c7', text: 'In Review' };
      case 'COMPLETED': return { color: '#059669', bg: '#d1fae5', text: 'Completed & Settled' };
      case 'WITHDRAWN': return { color: '#64748b', bg: '#f1f5f9', text: 'Funds Withdrawn' };
      default: return { color: '#64748b', bg: '#f1f5f9', text: status };
    }
  };

  return (
    <PageWrapper>
      <div className="wrap" style={{ padding: '40px 32px 80px', maxWidth: '960px' }}>
        {/* TOP BREADCRUMB / BACK LINK */}
        <button 
          onClick={() => router.back()} 
          className="btn btn-ghost btn-small"
          style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid var(--border-line)' }}>
            <p style={{ color: 'var(--text-subtle)' }}>Loading job details...</p>
          </div>
        ) : error || !job ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid var(--border-line)' }}>
            <FiAlertCircle style={{ fontSize: '32px', color: '#dc2626', marginBottom: '12px' }} />
            <h3>Project Not Found</h3>
            <p style={{ color: 'var(--text-subtle)', marginBottom: '20px' }}>{error || 'The requested project could not be found.'}</p>
            <Link href="/freelancer/dashboard" className="btn btn-primary btn-small">
              Browse Available Projects
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', alignItems: 'start' }}>
            {/* MAIN CONTENT COLUMN */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-line)', padding: '36px', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
              {/* STATUS ROW */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ 
                  fontSize: '12.5px', 
                  fontWeight: 700, 
                  color: getStatusColor(job.status).color, 
                  background: getStatusColor(job.status).bg, 
                  padding: '5px 12px', 
                  borderRadius: '6px' 
                }}>
                  {getStatusColor(job.status).text}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-subtle)', fontSize: '13px' }}>
                  <SiStellar size={14} color="var(--primary)" />
                  <span>Stellar Soroban</span>
                </div>
              </div>

              {/* TITLE */}
              <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-main)', lineHeight: 1.3 }}>
                {job.title}
              </h1>

              {/* BUDGET HIGHLIGHT BAR */}
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '18px 22px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Project Budget</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                    {job.budgetAmount} <span style={{ fontSize: '15px', fontWeight: 600 }}>{job.currency}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-subtle)', fontWeight: 600 }}>Payment Protection</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FiCheckCircle /> Soroban Smart Escrow
                  </div>
                </div>
              </div>

              {/* FULL DESCRIPTION */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-main)' }}>
                  Detailed Project Specification
                </h4>
                <div style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {job.description}
                </div>
              </div>

              {/* AI SPEC EVALUATION IF AVAILABLE */}
              {job.aiFeedback && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 20px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)' }}>
                    <FiShield color="var(--primary)" /> AI Smart Checker Assessment (Score: {job.aiScore || 85}/100)
                  </div>
                  <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {job.aiFeedback}
                  </p>
                </div>
              )}

              {/* WORK SUBMISSION IF AVAILABLE */}
              {job.workSubmission && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>Work Deliverable:</h4>
                  <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                    {job.workSubmission}
                  </div>
                  {job.clientReview && (
                    <div style={{ marginTop: '12px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                      <strong>Client Review:</strong> &ldquo;{job.clientReview}&rdquo; (Rating: {job.clientRating}/5)
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SIDEBAR COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* CLIENT CARD */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-line)', padding: '24px', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Client Information
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '17px' }}>
                    {job.client?.name ? job.client.name.slice(0, 1).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                      {job.client?.name || 'Verified Client'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                      {job.client?.stellarPubKey ? `${job.client.stellarPubKey.slice(0, 6)}...${job.client.stellarPubKey.slice(-4)}` : 'On-Chain Client'}
                    </div>
                  </div>
                </div>
              </div>

              {/* FREELANCER CARD IF ASSIGNED */}
              {job.freelancer && (
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-line)', padding: '24px', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Assigned Freelancer
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '17px' }}>
                      {job.freelancer.name ? job.freelancer.name.slice(0, 1).toUpperCase() : 'F'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                        {job.freelancer.name || 'Freelancer'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                        {job.freelancer.stellarPubKey ? `${job.freelancer.stellarPubKey.slice(0, 6)}...${job.freelancer.stellarPubKey.slice(-4)}` : ''}
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/freelancer/profile/${job.freelancer.stellarPubKey}`}
                    className="btn btn-ghost btn-small"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    View Freelancer Profile
                  </Link>
                </div>
              )}

              {/* SMART CONTRACT AUDIT INFO */}
              {job.escrowId && (
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-line)', padding: '24px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                    Smart Contract Details
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '4px' }}>Contract Address:</div>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--primary)', wordBreak: 'break-all' }}>
                    {job.escrowId}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
