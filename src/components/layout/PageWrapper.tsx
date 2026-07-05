import React from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
};
