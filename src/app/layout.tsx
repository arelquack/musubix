import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/Web3Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MusubiX | Decentralized Escrow',
  description: 'Secure, cross-border Web3 freelance marketplace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-blue-500/30 selection:text-blue-200`}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
