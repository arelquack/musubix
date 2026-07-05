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
            <button className="btn btn-primary btn-small" disabled style={{ opacity: 0.7 }}>
              {user.name}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
