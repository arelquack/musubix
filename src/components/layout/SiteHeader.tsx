'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export const SiteHeader = () => {
  const { user, login, isAuthenticating } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="wrap">
        <div className="header-top">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo-musubix.png" 
              alt="MusubiX Logo" 
              style={{ width: '34px', height: 'auto', display: 'block', objectFit: 'contain' }} 
            />
            <span>MusubiX</span>
          </Link>
          <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        <div className={`header-actions ${isOpen ? 'open' : ''}`}>
          <Link href="/freelancer/dashboard" className="btn btn-ghost btn-small">Find Work</Link>
          <Link href="/client/dashboard" className="btn btn-ghost btn-small">Client Dashboard</Link>
          {!user ? (
            <button className="btn btn-primary btn-small" onClick={() => {
              const email = prompt('Enter email to sign in: (e.g. client@musubix.com)');
              if (email) login(email);
            }} disabled={isAuthenticating}>
              {isAuthenticating ? 'Signing in...' : 'Sign in'}
            </button>
          ) : (
            <Link href={`/freelancer/profile/${user.stellarPubKey}`} className="btn btn-primary btn-small" title="View & Edit Profile">
              {user.name}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
