'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Horizon } from '@stellar/stellar-sdk';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'FREELANCER';
  stellarPubKey: string;
}

interface AuthContextType {
  user: User | null;
  balance: string | null;
  idrBalance: string | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticating: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  balance: null,
  idrBalance: null,
  login: async () => {},
  logout: () => {},
  isAuthenticating: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [idrBalance, setIdrBalance] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const fetchBalance = async (pubKey: string) => {
    try {
      const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await horizon.loadAccount(pubKey);
      
      const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
      if (nativeBalance) {
        setBalance(nativeBalance.balance);
      }
      
      const idrBalances = account.balances.filter((b) => (b as any).asset_code === 'IDR');
      if (idrBalances.length > 0) {
        const totalIdr = idrBalances.reduce((acc, curr) => acc + parseFloat(curr.balance), 0);
        setIdrBalance(totalIdr.toString());
      } else {
        setIdrBalance('0');
      }
    } catch (error: any) {
      console.error('Failed to fetch balance', error);
      setBalance('0');
      setIdrBalance('0');
    }
  };

  useEffect(() => {
    const savedUser = sessionStorage.getItem('musubix_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        fetchBalance(parsedUser.stellarPubKey);
      } catch (e) {
        sessionStorage.removeItem('musubix_user');
      }
    }
  }, []);

  const login = async (email: string) => {
    setIsAuthenticating(true);
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      setUser(data);
      sessionStorage.setItem('musubix_user', JSON.stringify(data));
      await fetchBalance(data.stellarPubKey);
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    setUser(null);
    setBalance(null);
    setIdrBalance(null);
    sessionStorage.removeItem('musubix_user');
  };

  return (
    <AuthContext.Provider value={{ user, balance, idrBalance, login, logout, isAuthenticating }}>
      {children}
    </AuthContext.Provider>
  );
};
