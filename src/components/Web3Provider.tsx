'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
import { Horizon } from '@stellar/stellar-sdk';

interface Web3ContextType {
  address: string | null;
  balance: string | null;
  idrBalance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  balance: null,
  idrBalance: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnecting: false,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [idrBalance, setIdrBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchBalance = async (pubKey: string) => {
    try {
      const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await horizon.loadAccount(pubKey);
      
      const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
      if (nativeBalance) {
        setBalance(nativeBalance.balance);
      }
      
      const idrBal = account.balances.find((b) => (b as any).asset_code === 'IDR');
      if (idrBal) {
        setIdrBalance(idrBal.balance);
      } else {
        setIdrBalance('0');
      }
    } catch (error) {
      console.error('Failed to fetch balance', error);
    }
  };

  useEffect(() => {
    try {
      StellarWalletsKit.init({
        network: Networks.TESTNET,
        modules: defaultModules(),
      });
      setIsInitialized(true);
      
      const savedAddress = sessionStorage.getItem('swk_address');
      if (savedAddress) {
        setAddress(savedAddress);
        fetchBalance(savedAddress);
      }
    } catch (e) {
      console.error("Kit initialization error", e);
    }
  }, []);

  const connectWallet = async () => {
    if (!isInitialized) return;
    setIsConnecting(true);
    try {
      const { address: publicKey } = await StellarWalletsKit.authModal();
      setAddress(publicKey);
      sessionStorage.setItem('swk_address', publicKey);
      await fetchBalance(publicKey);
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet. Are you on Testnet?');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    try {
      StellarWalletsKit.disconnect();
    } catch(e) {}
    setAddress(null);
    setBalance(null);
    sessionStorage.removeItem('swk_address');
  };

  return (
    <Web3Context.Provider value={{ address, balance, idrBalance, connectWallet, disconnectWallet, isConnecting }}>
      {children}
    </Web3Context.Provider>
  );
};
