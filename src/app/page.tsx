'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PreciseGlobe } from '@/components/common/PreciseGlobe';
import { SiStellar } from 'react-icons/si';
import { 
  FiSearch, 
  FiArrowRight, 
  FiShield, 
  FiCode, 
  FiCpu, 
  FiLayout, 
  FiBarChart2, 
  FiSmartphone, 
  FiEdit3, 
  FiRepeat, 
  FiCheckCircle,
  FiTrendingUp,
  FiLayers,
  FiZap,
  FiGlobe
} from 'react-icons/fi';

export default function Home() {
  const [stats, setStats] = useState({ totalJobsCompleted: 0, totalFundsDistributed: 0 });
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/jobs/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    fetch('http://localhost:4000/jobs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setJobs(data);
      })
      .catch(console.error);
  }, []);

  const categories = [
    { title: 'UI/UX Design', count: '12 Jobs Available', icon: <FiLayout /> },
    { title: 'Smart Contracts', count: '8 Jobs Available', icon: <FiZap /> },
    { title: 'Fullstack Web3', count: '15 Jobs Available', icon: <FiCode /> },
    { title: 'Data & Analytics', count: '9 Jobs Available', icon: <FiBarChart2 /> },
    { title: 'Mobile Dev', count: '7 Jobs Available', icon: <FiSmartphone /> },
    { title: 'Content & Copy', count: '11 Jobs Available', icon: <FiEdit3 /> },
    { title: 'DeFi & DEX Integration', count: '6 Jobs Available', icon: <FiRepeat /> },
    { title: 'Security Audit', count: '4 Jobs Available', icon: <FiShield /> },
  ];

  const popularTags = ['Rust Soroban', 'React / Next.js', 'Escrow Contract', 'Machine Learning', 'Python ETL', 'UI Designer'];

  const displayedJobs = jobs.length > 0 ? jobs.slice(0, 6) : [
    {
      id: 'demo-1',
      title: 'Soroban Smart Contract Developer',
      budgetAmount: '2,500',
      currency: 'XLM',
      description: 'Build escrow payment logic and testnet integration using Soroban SDK Rust.',
      client: { name: 'Astra Labs' }
    },
    {
      id: 'demo-2',
      title: 'Fullstack Next.js Web3 App',
      budgetAmount: '500',
      currency: 'USDC',
      description: 'Implement frontend custodial wallet interaction and Stellar payment checkout.',
      client: { name: 'Horizon Studio' }
    },
    {
      id: 'demo-3',
      title: 'Brand Designer & Vector Assets',
      budgetAmount: '1,200',
      currency: 'XLM',
      description: 'Modern minimalist vector design with source files (.AI/.Figma) for fintech startup.',
      client: { name: 'Knot Pay' }
    },
    {
      id: 'demo-4',
      title: 'Data Science & Model Deployment',
      budgetAmount: '1,800',
      currency: 'USDC',
      description: 'Build predictive model and deploy containerized FastAPI endpoint.',
      client: { name: 'Nexus AI' }
    },
    {
      id: 'demo-5',
      title: 'Technical Writer & Soroban Docs',
      budgetAmount: '450',
      currency: 'USDC',
      description: 'Produce developer guides and tutorial repository for decentralized freelancing.',
      client: { name: 'OpenStellar' }
    },
    {
      id: 'demo-6',
      title: 'DeFi Liquidity Pool Specialist',
      budgetAmount: '3,200',
      currency: 'XLM',
      description: 'Configure market making and IDR orderbook peg on Stellar DEX testnet.',
      client: { name: 'Rupiah Stable' }
    }
  ];

  return (
    <PageWrapper>
      <main>
        {/* ================= HERO SECTION ================= */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <div className="hero-tag-clean">
                <SiStellar size={16} />
                <span>Powered by Stellar</span>
              </div>

              <h1>Your Career Starts Here.<br/>The <em>World Awaits</em>.</h1>
              <p className="lede">
                Whether you&apos;re hiring top global talent or looking for your next high-impact project, payments lock safely in automated escrow and release instantly upon mutual approval.
              </p>

              {/* SEARCH BAR (CLEAN LIGHT TALENTBRIDGE STYLE) */}
              <div className="search-bar-wrap">
                <FiSearch style={{ color: 'var(--text-light)', fontSize: '18px', marginRight: '10px', flexShrink: 0 }} />
                <input
                  type="text"
                  className="search-bar-input"
                  placeholder="Job title, skill, or keyword (e.g. Soroban, Next.js)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Link href="/freelancer/dashboard" className="search-bar-btn" title="Search Jobs">
                  <FiArrowRight style={{ fontSize: '18px' }} />
                </Link>
              </div>

              {/* POPULAR SEARCH TAGS (CLEAN RECTANGULAR CHIPS) */}
              <div className="popular-tags">
                <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>Popular:</span>
                {popularTags.map(tag => (
                  <Link key={tag} href="/freelancer/dashboard" className="popular-tag-item">
                    {tag}
                  </Link>
                ))}
              </div>

              {/* HERO CTA BUTTONS (MOVED CLEANLY TO THE LEFT) */}
              <div className="hero-btn-row" style={{ display: 'flex', gap: '14px', marginTop: '28px', flexWrap: 'wrap' }}>
                <Link href="/client/dashboard" className="btn btn-primary" style={{ padding: '13px 26px' }}>
                  Post a Project
                </Link>
                <Link href="/freelancer/dashboard" className="btn btn-ghost" style={{ padding: '13px 26px' }}>
                  Explore Talents
                </Link>
              </div>
            </div>

            {/* HERO RIGHT: HIGH-PRECISION 3D INTERACTIVE GLOBE */}
            <div className="hero-illustration-scene">
              <div className="globe-canvas-wrap">
                <PreciseGlobe size={440} />
              </div>

              {/* Floating Verified Badge 1 */}
              <div className="hero-float-card hero-float-top">
                <div className="hero-float-icon">
                  <FiGlobe />
                </div>
                <div className="hero-float-text">
                  <h5>Global Talent Network</h5>
                  <p>Cross-Border Contracts</p>
                </div>
              </div>

              {/* Floating Verified Badge 2 */}
              <div className="hero-float-card hero-float-bottom">
                <div className="hero-float-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <FiCheckCircle />
                </div>
                <div className="hero-float-text">
                  <h5>Instant Settlement</h5>
                  <p>Locked in Smart Escrow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= NETWORK PERFORMANCE HIGHLIGHTS ================= */}
        <section className="performance-strip">
          <div className="wrap">
            <div className="perf-grid">
              <div className="perf-card">
                <div className="perf-icon-wrap">
                  <FiZap />
                </div>
                <div className="perf-details">
                  <div className="perf-val">&lt; 5 Seconds</div>
                  <div className="perf-label">Avg. Payout Settlement</div>
                </div>
              </div>

              <div className="perf-card">
                <div className="perf-icon-wrap" style={{ color: 'var(--accent-green)' }}>
                  <FiTrendingUp />
                </div>
                <div className="perf-details">
                  <div className="perf-val">&lt; $0.0001</div>
                  <div className="perf-label">Ultra-Low Gas Fee</div>
                </div>
              </div>

              <div className="perf-card">
                <div className="perf-icon-wrap" style={{ color: 'var(--accent-gold)' }}>
                  <FiShield />
                </div>
                <div className="perf-details">
                  <div className="perf-val">100%</div>
                  <div className="perf-label">Escrow Backed Trust</div>
                </div>
              </div>

              <div className="perf-card">
                <div className="perf-icon-wrap" style={{ color: 'var(--primary)' }}>
                  <FiLayers />
                </div>
                <div className="perf-details">
                  <div className="perf-val">{stats.totalJobsCompleted || 14}+ Jobs</div>
                  <div className="perf-label">Successfully Settled</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TRUSTED BY ECOSYSTEM ================= */}
        <section className="trusted-section">
          <div className="wrap">
            <div className="trusted-box">
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-subtle)', fontWeight: 700 }}>
                Work With Next-Gen Stellar & Web3 Infrastructure
              </div>
              <div className="trusted-logos">
                <div className="trusted-logo-item">
                  <SiStellar size={20} color="var(--primary)" /> STELLAR
                </div>
                <div className="trusted-logo-item">
                  <FiZap color="var(--primary)" /> SOROBAN
                </div>
                <div className="trusted-logo-item">
                  <FiShield color="var(--primary)" /> FREIGHTER
                </div>
                <div className="trusted-logo-item">
                  <FiLayers color="var(--primary)" /> HORIZON
                </div>
                <div className="trusted-logo-item">
                  <FiRepeat color="var(--primary)" /> STELLAR DEX
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHERE AMBITION MEETS OPPORTUNITY ================= */}
        <section className="opportunity-section">
          <div className="wrap">
            <div className="opportunity-grid">
              <div className="opp-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
                  <FiGlobe /> Global Connectivity
                </div>
                <h3>Where Ambition Meets Opportunity</h3>
                <p>
                  Connect with clients and companies worldwide. Zero foreign exchange barriers, no withholding periods, and full transparency on public ledger records.
                </p>
                <div>
                  <Link href="/client/dashboard" className="btn btn-primary">
                    Explore Platform
                  </Link>
                </div>
              </div>

              <div className="opp-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
                  <FiShield /> Protected Escrow
                </div>
                <h3>Guaranteed Payment Security</h3>
                <p>
                  Funds are secured in Soroban smart contracts from the second work is accepted. Freelancers deliver with confidence, knowing payment is already deposited.
                </p>
                <div>
                  <Link href="/freelancer/dashboard" className="btn btn-ghost">
                    Browse Projects
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MOST DEMANDED JOB CATEGORIES (NAVY CONTAINER) ================= */}
        <section className="categories-section" id="categories">
          <div className="wrap">
            <div className="categories-container">
              <div className="categories-header">
                <h2>Most Demanded Job Categories</h2>
              </div>

              <div className="categories-grid">
                {categories.map((cat, idx) => (
                  <Link href="/freelancer/dashboard" key={idx} className="category-card">
                    <div className="category-icon-box">
                      {cat.icon}
                    </div>
                    <div className="category-info">
                      <h4>{cat.title}</h4>
                      <span>{cat.count}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= LATEST JOBS OPEN ================= */}
        <section className="latest-jobs-section">
          <div className="wrap">
            <div className="section-header-row">
              <div>
                <h2 style={{ fontSize: '30px', margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                  Latest Jobs Open
                </h2>
              </div>
              <Link href="/freelancer/dashboard" className="btn btn-primary btn-small">
                View All
              </Link>
            </div>

            <div className="latest-jobs-grid">
              {displayedJobs.map((job) => (
                <div key={job.id} className="job-item-card">
                  <div className="job-item-header">
                    <div className="job-company-avatar">
                      {job.client?.name ? job.client.name.slice(0, 1).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {job.title}
                      </h4>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-subtle)' }}>
                        {job.client?.name || 'Verified Client'}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </p>

                  <div className="job-item-tags">
                    <span className="job-tag tag-primary">Escrow Secured</span>
                    <span className="job-tag tag-secondary">Stellar Testnet</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '17px', fontWeight: 700, color: 'var(--primary)' }}>
                        {job.budgetAmount}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-subtle)', marginLeft: '4px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {job.currency}
                      </span>
                    </div>
                    <Link href="/freelancer/dashboard" className="btn btn-ghost btn-small">
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= COMMUNITY / TESTIMONIALS ================= */}
        <section className="community-section" id="community">
          <div className="wrap">
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h2 style={{ fontSize: '30px', margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                What Our Community Says!
              </h2>
            </div>

            <div className="community-grid">
              <div className="community-card-stat">
                <div>
                  <div style={{ fontSize: '52px', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1 }}>
                    50%
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, margin: '14px 0 8px', color: '#ffffff' }}>
                    Fee Savings Over Web2 Platforms
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                    Traditional agencies take 15-25% commissions. On Musubix, smart escrow transactions cost fractions of a cent on Stellar.
                  </p>
                </div>
                <div style={{ paddingTop: '18px', borderTop: '1px solid #1e293b' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Cryptographically Verified Transfers</span>
                </div>
              </div>

              <div className="community-quote-card">
                <div>
                  <p style={{ fontSize: '16.5px', color: 'var(--text-main)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                    &ldquo;Receiving international cross-border freelance payments used to be complicated by foreign exchange rates and delays. With Soroban escrow, clients deposit upfront, and funds release instantly upon completion.&rdquo;
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    AZ
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>Arel Z.</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-subtle)' }}>Fullstack Web3 Developer</div>
                  </div>
                </div>
              </div>

              <div className="community-card-stat">
                <div>
                  <div style={{ fontSize: '52px', fontWeight: 800, color: 'var(--accent-green)', lineHeight: 1 }}>
                    &lt; 5s
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, margin: '14px 0 8px', color: '#ffffff' }}>
                    Instant Consensus Finality
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                    Stellar ledger closes every 3 to 5 seconds with immediate cryptographic finality.
                  </p>
                </div>
                <div style={{ paddingTop: '18px', borderTop: '1px solid #1e293b' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Soroban Smart Contract Engine</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= NEWSLETTER / BANNER ================= */}
        <section className="wrap">
          <div className="newsletter-banner">
            <div className="newsletter-banner-content">
              <h3>Don&apos;t miss out on any career updates</h3>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>
                Join verified professionals receiving smart escrow task notifications and project opportunities.
              </p>
            </div>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed to Musubix updates!'); }}>
              <input type="email" required placeholder="Enter your email address..." className="newsletter-input" />
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}