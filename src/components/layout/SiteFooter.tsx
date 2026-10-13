import React from 'react';
import Link from 'next/link';

export const SiteFooter = () => {
  return (
    <footer className="footer-container">
      <div className="wrap">
        <div className="footer-main-row">
          <div>
            <Link href="/" className="brand" style={{ fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px', textDecoration: 'none' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo-musubix.png" 
                alt="MusubiX Logo" 
                style={{ width: '28px', height: 'auto', display: 'block', objectFit: 'contain' }} 
              />
              <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>MusubiX</span>
            </Link>
            <p style={{ color: 'var(--text-2)', fontSize: '14px', maxWidth: '34ch', lineHeight: 1.6, margin: 0 }}>
              The decentralized borderless freelance platform tied by Stellar and powered by Soroban escrow smart contracts.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h5>Partner with us</h5>
              <ul>
                <li><Link href="/client/dashboard">Post a Project</Link></li>
                <li><Link href="#features">Smart Escrow</Link></li>
                <li><Link href="#categories">Talent Directory</Link></li>
                <li><a href="https://stellar.org" target="_blank" rel="noreferrer">Stellar DEX</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Freelancers</h5>
              <ul>
                <li><Link href="/freelancer/dashboard">Browse Jobs</Link></li>
                <li><Link href="/freelancer/dashboard">Custodial Wallet</Link></li>
                <li><Link href="#community">Success Stories</Link></li>
                <li><a href="https://soroban.stellar.org" target="_blank" rel="noreferrer">Soroban Docs</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Ecosystem</h5>
              <ul>
                <li><Link href="#categories">UI/UX Design</Link></li>
                <li><Link href="#categories">Blockchain Dev</Link></li>
                <li><Link href="#categories">Data Science</Link></li>
                <li><Link href="#categories">Smart Contracts</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Resources</h5>
              <ul>
                <li><a href="https://testnet.stellarchain.io" target="_blank" rel="noreferrer">Stellar Explorer</a></li>
                <li><a href="https://laboratory.stellar.org" target="_blank" rel="noreferrer">Laboratory</a></li>
                <li><a href="https://discord.gg/stellar" target="_blank" rel="noreferrer">Discord Devs</a></li>
                <li><a href="https://github.com" target="_blank" rel="noreferrer">Open Source</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Stellar Testnet Live Demo &middot; Non-production environment</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Musubix. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
