'use client';
import React from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/components/Web3Provider';

export const SiteHeader = () => {
  const { address, connectWallet, isConnecting } = useWeb3();

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand">
          <svg className="knot-mark" viewBox="0 0 60 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="knotGradSmall" x1="0" y1="0" x2="60" y2="0">
                <stop offset="0%" stopColor="#c8493c"/>
                <stop offset="100%" stopColor="#c9a24b"/>
              </linearGradient>
            </defs>
            <path d="M4 17C4 6 16 4 22 10C28 16 28 18 22 24C16 30 4 28 4 17Z" stroke="url(#knotGradSmall)" strokeWidth="3" strokeLinecap="round"/>
            <path d="M56 17C56 6 44 4 38 10C32 16 32 18 38 24C44 30 56 28 56 17Z" stroke="url(#knotGradSmall)" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span>Musubix</span>
        </Link>
        <div className="header-actions">
          <Link href="/freelancer/dashboard" className="btn btn-ghost btn-small">Find Work</Link>
          <Link href="/client/dashboard" className="btn btn-ghost btn-small">Client Dashboard</Link>
          {!address ? (
            <button className="btn btn-primary btn-small" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect wallet'}
            </button>
          ) : (
            <button className="btn btn-primary btn-small" disabled style={{ opacity: 0.7 }}>
              Wallet connected
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
