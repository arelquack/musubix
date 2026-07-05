import React from 'react';

export const SiteFooter = () => {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span className="brand" style={{ fontSize: '16px' }}>
          <svg className="knot-mark" style={{ width: '22px', height: '13px' }} viewBox="0 0 60 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 17C4 6 16 4 22 10C28 16 28 18 22 24C16 30 4 28 4 17Z" stroke="#6d7288" strokeWidth="3" strokeLinecap="round"/>
            <path d="M56 17C56 6 44 4 38 10C32 16 32 18 38 24C44 30 56 28 56 17Z" stroke="#6d7288" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Musubix
        </span>
        <p>Stellar Testnet demo — no real funds move.</p>
      </div>
    </footer>
  );
};
