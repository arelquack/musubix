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
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  balance: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnecting: false,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the kit only on the client side to avoid Next.js SSR issues
    try {
      StellarWalletsKit.init({
        network: Networks.TESTNET,
        modules: defaultModules(),
      });
      setIsInitialized(true);
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
            
      // Fetch testnet balance
      const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await horizon.loadAccount(publicKey);
      const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
      if (nativeBalance) {
        setBalance(nativeBalance.balance);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet or fetch balance. Are you on Testnet?');
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
  };

  return (
    <Web3Context.Provider value={{ address, balance, connectWallet, disconnectWallet, isConnecting }}>
      {children}
    </Web3Context.Provider>
  );
};
