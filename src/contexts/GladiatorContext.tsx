'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { publicClient } from '@/lib/viem';
import { contracts } from '@/config/contracts';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Gladiator {
  name: string;
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  defense: number;
  experience: number;
  level: number;
  wins: number;
  losses: number;
  lastFight: number;
  battleCry: string;
  winStreak: number;
}

interface GladiatorEntry {
  address: `0x${string}`;
  gladiator: Gladiator;
  earnings: bigint;
}

interface GladiatorContextType {
  gladiators: GladiatorEntry[];
  refreshGladiators: (address: `0x${string}`) => Promise<void>;
  getGladiator: (address: `0x${string}`) => GladiatorEntry | undefined;
  isLoading: boolean;
  error: Error | null;
  address: `0x${string}` | null;
  setAddress: (address: `0x${string}` | null) => void;
}

const GladiatorContext = createContext<GladiatorContextType>({
  gladiators: [],
  refreshGladiators: async () => {},
  getGladiator: () => undefined,
  isLoading: false,
  error: null,
  address: null,
  setAddress: () => {},
});

// Cache configuration
const CACHE_DURATION = 30000; // 30 seconds
interface CacheEntry {
  data: GladiatorEntry[];
  timestamp: number;
}
let gladiatorCache: CacheEntry | null = null;

export function GladiatorProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useLocalStorage<`0x${string}` | null>('wallet_address', null);
  const [gladiators, setGladiators] = useState<GladiatorEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isCacheValid = () => {
    if (!gladiatorCache) return false;
    return Date.now() - gladiatorCache.timestamp < CACHE_DURATION;
  };

  const fetchGladiators = async (walletAddress: `0x${string}`) => {
    if (!walletAddress) {
      setGladiators([]);
      return;
    }

    // Check cache first
    if (isCacheValid() && gladiatorCache) {
      setGladiators(gladiatorCache.data);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get gladiator data
      const gladiatorData = await publicClient.readContract({
        ...contracts.gladiatorArena,
        functionName: 'getGladiator',
        args: [walletAddress],
      }) as Gladiator;

      // Get earnings data
      const earnings = await publicClient.readContract({
        ...contracts.gladiatorArena,
        functionName: 'getEarnings',
        args: [walletAddress],
      }) as bigint;

      const newGladiators = [{
        address: walletAddress,
        gladiator: gladiatorData,
        earnings: earnings,
      }];

      // Update cache
      gladiatorCache = {
        data: newGladiators,
        timestamp: Date.now(),
      };

      setGladiators(newGladiators);
    } catch (error) {
      console.error('Failed to fetch gladiators:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch gladiators'));
      setGladiators([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchGladiators(address);
    }

    // Only update when page is visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && address) {
        fetchGladiators(address);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh every 30 seconds when visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && address) {
        fetchGladiators(address);
      }
    }, CACHE_DURATION);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [address]);

  const getGladiator = (addr: `0x${string}`) => {
    return gladiators.find(g => g.address === addr);
  };

  return (
    <GladiatorContext.Provider value={{ 
      gladiators, 
      refreshGladiators: fetchGladiators,
      getGladiator,
      isLoading,
      error,
      address,
      setAddress,
    }}>
      {children}
    </GladiatorContext.Provider>
  );
}

export const useGladiators = () => useContext(GladiatorContext); 