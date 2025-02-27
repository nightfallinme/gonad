'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { publicClient } from '@/lib/viem';
import { contracts } from '@/config/contracts';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface TokenContextType {
  balance: bigint | null;
  refreshBalance: (address: `0x${string}`) => Promise<void>;
  address: `0x${string}` | null;
  setAddress: (address: `0x${string}` | null) => void;
}

const TokenContext = createContext<TokenContextType>({
  balance: null,
  refreshBalance: async () => {},
  address: null,
  setAddress: () => {},
});

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useLocalStorage<`0x${string}` | null>('wallet_address', null);
  const [balance, setBalance] = useState<bigint | null>(null);

  const fetchBalance = async (walletAddress: `0x${string}`) => {
    if (!walletAddress) {
      setBalance(null);
      return;
    }

    try {
      const balance = await publicClient.readContract({
        ...contracts.gonadToken,
        functionName: 'balanceOf',
        args: [walletAddress],
      }) as bigint;

      setBalance(balance);
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
      setBalance(null);
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance(address);
    }
    
    // Only update when page is visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && address) {
        fetchBalance(address);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [address]);

  return (
    <TokenContext.Provider value={{ 
      balance, 
      refreshBalance: fetchBalance,
      address,
      setAddress,
    }}>
      {children}
    </TokenContext.Provider>
  );
}

export const useToken = () => useContext(TokenContext); 