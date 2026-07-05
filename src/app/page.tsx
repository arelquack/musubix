'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function Home() {
  const [stats, setStats] = useState({ totalJobsCompleted: 0, totalFundsDistributed: 0 });

  useEffect(() => {
    fetch('http://localhost:4000/jobs/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <PageWrapper>
      <main>
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">Built on Stellar &middot; Soroban escrow</span>
              <h1>Hire and get hired<br/>without the <em>border tax</em>.</h1>
              <p className="lede">Post a task, and your payment locks in a smart contract the moment work begins. It converts between currencies automatically and releases the instant you approve — no wire fees, no waiting on a bank.</p>
              
              <div className="stats-container" style={{ marginTop: '32px', marginBottom: '40px', display: 'flex', gap: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '36px', fontWeight: 500, fontFamily: 'var(--font-display)', color: 'var(--matsu)', lineHeight: 1 }}>{stats.totalJobsCompleted}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px', fontWeight: 600 }}>Jobs Completed</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '36px', fontWeight: 500, fontFamily: 'var(--font-display)', color: 'var(--matsu)', lineHeight: 1 }}>{stats.totalFundsDistributed.toLocaleString()} <span style={{ fontSize: '18px', color: 'var(--text-2)' }}>XLM</span></span>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px', fontWeight: 600 }}>Funds Distributed</span>
                </div>
              </div>

              <div className="hero-cta">
                <Link href="/client/dashboard" className="btn btn-primary">I want to hire</Link>
                <Link href="/freelancer/dashboard" className="btn btn-ghost">I want to work</Link>
              </div>
              <p className="hero-note">Live on Stellar Testnet — pay in XLM, USDC, or IDR.</p>
            </div>

            <div className="hero-visual">
              <div className="ring"></div>
              <div className="ring ring-2"></div>
              <svg className="knot-big" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="knotGradBig" x1="0" y1="0" x2="200" y2="0">
                    <stop offset="0%" stopColor="#c8493c"/>
                    <stop offset="55%" stopColor="#c9a24b"/>
                    <stop offset="100%" stopColor="#5c7fa8"/>
                  </linearGradient>
                </defs>
                <path d="M14 60C14 22 54 14 74 36C94 58 94 62 74 84C54 106 14 98 14 60Z" stroke="url(#knotGradBig)" strokeWidth="5" strokeLinecap="round"/>
                <path d="M186 60C186 22 146 14 126 36C106 58 106 62 126 84C146 106 186 98 186 60Z" stroke="url(#knotGradBig)" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </section>

        <div className="wrap">
          <svg className="cord" viewBox="0 0 1180 12" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,6 C30,-2 60,14 90,6 C120,-2 150,14 180,6 C210,-2 240,14 270,6 C300,-2 330,14 360,6 C390,-2 420,14 450,6 C480,-2 510,14 540,6 C570,-2 600,14 630,6 C660,-2 690,14 720,6 C750,-2 780,14 810,6 C840,-2 870,14 900,6 C930,-2 960,14 990,6 C1020,-2 1050,14 1080,6 C1110,-2 1140,14 1170,6" stroke="#c8493c" strokeWidth="1.4" fill="none" opacity="0.55"/>
            <path d="M0,6 C30,-2 60,14 90,6 C120,-2 150,14 180,6 C210,-2 240,14 270,6 C300,-2 330,14 360,6 C390,-2 420,14 450,6 C480,-2 510,14 540,6 C570,-2 600,14 630,6 C660,-2 690,14 720,6 C750,-2 780,14 810,6 C840,-2 870,14 900,6 C930,-2 960,14 990,6 C1020,-2 1050,14 1080,6 C1110,-2 1140,14 1170,6" stroke="#c9a24b" strokeWidth="1.4" fill="none" opacity="0.55" transform="translate(10,0)"/>
            <path d="M0,6 C30,-2 60,14 90,6 C120,-2 150,14 180,6 C210,-2 240,14 270,6 C300,-2 330,14 360,6 C390,-2 420,14 450,6 C480,-2 510,14 540,6 C570,-2 600,14 630,6 C660,-2 690,14 720,6 C750,-2 780,14 810,6 C840,-2 870,14 900,6 C930,-2 960,14 990,6 C1020,-2 1050,14 1080,6 C1110,-2 1140,14 1170,6" stroke="#5c7fa8" strokeWidth="1.4" fill="none" opacity="0.55" transform="translate(20,0)"/>
          </svg>
        </div>

        <section className="features" id="features">
          <div className="wrap">
            <p className="section-label">Why Musubix</p>
            <h2 className="section-title">Three threads, one knot: trust, rate, and speed.</h2>

            <div className="feature-grid">
              <div className="feature-card">
                <svg viewBox="0 0 300 8" preserveAspectRatio="none" aria-hidden="true" style={{width: '100%', height: '8px', display: 'block'}}>
                  <path d="M0,4 C25,-1 50,9 75,4 C100,-1 125,9 150,4 C175,-1 200,9 225,4 C250,-1 275,9 300,4" stroke="#c8493c" strokeWidth="2" fill="none"/>
                </svg>
                <div className="card-body">
                  <h3>Smart escrow</h3>
                  <p>Your payment locks in a Soroban contract the moment you post the job. Nobody touches it until you approve the work — not even us.</p>
                </div>
              </div>

              <div className="feature-card">
                <svg viewBox="0 0 300 8" preserveAspectRatio="none" aria-hidden="true" style={{width: '100%', height: '8px', display: 'block'}}>
                  <path d="M0,4 C25,-1 50,9 75,4 C100,-1 125,9 150,4 C175,-1 200,9 225,4 C250,-1 275,9 300,4" stroke="#5c7fa8" strokeWidth="2" fill="none"/>
                </svg>
                <div className="card-body">
                  <h3>Auto-conversion</h3>
                  <p>Pay in XLM, get paid in IDR — or the other way around. We convert at the live DEX rate as the job closes, so nothing gets stuck in exchange fees.</p>
                </div>
              </div>

              <div className="feature-card">
                <svg viewBox="0 0 300 8" preserveAspectRatio="none" aria-hidden="true" style={{width: '100%', height: '8px', display: 'block'}}>
                  <path d="M0,4 C25,-1 50,9 75,4 C100,-1 125,9 150,4 C175,-1 200,9 225,4 C250,-1 275,9 300,4" stroke="#c9a24b" strokeWidth="2" fill="none"/>
                </svg>
                <div className="card-body">
                  <h3>Micro-task ready</h3>
                  <p>Built for a two-hour translation or a one-day illustration — not enterprise contracts with twelve approval steps.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="how">
          <div className="wrap">
            <p className="section-label">How it works</p>
            <h2 className="section-title">From posting to payout, in three steps.</h2>

            <div className="steps">
              <div className="step">
                <span className="num">01</span>
                <h4>Post the job</h4>
                <p>Describe the task and its price. Funds move into escrow the moment someone accepts.</p>
              </div>
              <div className="step">
                <span className="num">02</span>
                <h4>Work gets done</h4>
                <p>A freelancer delivers, you review the result, and ask for changes if it&apos;s not quite there.</p>
              </div>
              <div className="step">
                <span className="num">03</span>
                <h4>Untie the knot</h4>
                <p>Approve the work and the contract releases funds instantly — converted, if needed, on the way out.</p>
              </div>

              <div className="steps-cord">
                <svg viewBox="0 0 1180 14" preserveAspectRatio="none" aria-hidden="true" style={{width: '100%', height: '14px'}}>
                  <path d="M0,7 C40,-3 80,17 120,7 C160,-3 200,17 240,7 C280,-3 320,17 360,7 C400,-3 440,17 480,7 C520,-3 560,17 600,7 C640,-3 680,17 720,7 C760,-3 800,17 840,7 C880,-3 920,17 960,7 C1000,-3 1040,17 1080,7 C1110,-1 1140,15 1170,7" stroke="#2b2f42" strokeWidth="2" fill="none"/>
                  <circle cx="0" cy="7" r="4" fill="#c8493c"/>
                  <circle cx="590" cy="7" r="4" fill="#c9a24b"/>
                  <circle cx="1170" cy="7" r="4" fill="#5c7fa8"/>
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}