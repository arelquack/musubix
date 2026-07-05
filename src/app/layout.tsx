import type { Metadata } from 'next';
import { Inter, Shippori_Mincho, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const shippori = Shippori_Mincho({ weight: ['500', '600'], subsets: ['latin'], variable: '--font-shippori' });
const jetbrains = JetBrains_Mono({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'Musubix — Borderless micro-freelance, tied by Stellar',
  description: 'Secure, cross-border Web3 freelance marketplace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${shippori.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
