'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sword, Swords } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useGladiatorImages } from '@/hooks/useGladiatorImages';
import { publicClient } from '@/lib/viem';
import { useGladiators } from '@/contexts/GladiatorContext';
import { Card } from '@/components/ui/card';
import { contracts } from '@/config/contracts';
import Image from 'next/image';

interface BattleLogEntry {
  winner: `0x${string}`;
  loser: `0x${string}`;
  timestamp: number;
  epicMoment: string;
  rarity: number;
}

interface ExtendedBattleLogEntry extends BattleLogEntry {
  winnerName: string;
  loserName: string;
}

interface CacheData {
  battles: ExtendedBattleLogEntry[];
  timestamp: number;
}

const CACHE_DURATION = 30000; // 30 saniye cache süresi
let battleCache: CacheData | null = null;

export function BattleLog() {
  const { getGladiatorImage } = useGladiatorImages();
  const { gladiators } = useGladiators();
  const [battles, setBattles] = useState<ExtendedBattleLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  // Cache'in geçerli olup olmadığını kontrol et
  const isCacheValid = useMemo(() => {
    if (!battleCache) return false;
    const now = Date.now();
    return now - battleCache.timestamp < CACHE_DURATION;
  }, [lastUpdate]);

  // Son savaşları kontrat üzerinden oku
  const loadBattles = async () => {
    try {
      // Eğer cache geçerliyse, cache'den veriyi kullan
      if (isCacheValid && battleCache) {
        setBattles(battleCache.battles);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      // Son savaşları al
      const recentBattles = await publicClient.readContract({
        ...contracts.gladiatorArena,
        functionName: 'getRecentBattles',
      }) as BattleLogEntry[];

      // Gladyatör isimlerini context'ten al
      const extendedBattles = recentBattles.map(battle => {
        const winnerGladiator = gladiators.find(g => g.address === battle.winner);
        const loserGladiator = gladiators.find(g => g.address === battle.loser);

        return {
          ...battle,
          winnerName: winnerGladiator?.gladiator.name || formatAddress(battle.winner),
          loserName: loserGladiator?.gladiator.name || formatAddress(battle.loser)
        };
      });

      // Cache'i güncelle
      battleCache = {
        battles: extendedBattles,
        timestamp: Date.now()
      };
      setLastUpdate(Date.now());
      setBattles(extendedBattles);
    } catch (error: unknown) {
      console.error('Error loading recent battles:', error);
      // Eğer rate limit hatası alındıysa, 5 saniye bekle ve tekrar dene
      if (error instanceof Error && error.message.includes('429')) {
        setTimeout(loadBattles, 5000);
      }
      // Cache varsa cache'deki veriyi kullan, yoksa boş array
      setBattles(battleCache?.battles || []);
    } finally {
      setIsLoading(false);
    }
  };

  // İlk yüklemede ve her 2 dakikada bir savaşları güncelle
  useEffect(() => {
    if (gladiators.length > 0) {
      loadBattles();
      const interval = setInterval(loadBattles, 120000); // 2 dakika
      return () => clearInterval(interval);
    }
  }, [gladiators]);

  const getRarityColor = (rarity: number) => {
    switch (rarity) {
      case 0: // COMMON
        return 'bg-neutral-500 hover:bg-neutral-400';
      case 1: // UNCOMMON
        return 'bg-emerald-500 hover:bg-emerald-400';
      case 2: // RARE
        return 'bg-blue-500 hover:bg-blue-400';
      case 3: // EPIC
        return 'bg-purple-500 hover:bg-purple-400';
      case 4: // LEGENDARY
        return 'bg-amber-500 hover:bg-amber-400';
      default:
        return 'bg-neutral-500 hover:bg-neutral-400';
    }
  };

  const getRarityText = (rarity: number) => {
    switch (rarity) {
      case 0: return 'COMMON';
      case 1: return 'UNCOMMON';
      case 2: return 'RARE';
      case 3: return 'EPIC';
      case 4: return 'LEGENDARY';
      default: return 'UNKNOWN';
    }
  };

  const formatAddress = (address: `0x${string}`) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <div className="flex flex-col mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <Sword className="w-6 h-6 text-[#6D28D9]" />
            <div className="absolute inset-0 bg-[#6D28D9]/20 rounded-full filter blur-[8px] animate-pulse" />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
            Recent Battles
          </h2>
        </div>
        <div className="w-full h-px bg-white/10" />
      </div>
      <div className="-mr-4 flex-1">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6D28D9]" />
            </div>
          ) : battles.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              No battles found yet
            </div>
          ) : (
            <div className="space-y-2 pr-4">
              {battles.map((battle, index) => (
                <div key={index} className="group">
                  <div className="bg-black/40 backdrop-blur rounded-lg border-2 border-[#6D28D9] group-hover:border-[#7C3AED] group-hover:bg-black/50 transition-all duration-300 overflow-hidden">
                    <div className="flex items-center justify-between p-2 border-b border-[#6D28D9]">
                      <span className="text-xs text-neutral-300">
                        {formatTime(battle.timestamp)}
                      </span>
                      <Badge className={`${getRarityColor(battle.rarity)} transition-colors shadow-lg text-xs`}>
                        {getRarityText(battle.rarity)}
                      </Badge>
                    </div>
                    <div className="p-2">
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-red-500/20 relative">
                              <Image
                                src={getGladiatorImage(battle.loser)}
                                alt={battle.loserName}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                            <span className="text-red-400 text-sm">{battle.loserName}</span>
                          </div>
                        </div>
                        <Swords className="w-4 h-4 text-[#6D28D9]" />
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500/20 relative">
                              <Image
                                src={getGladiatorImage(battle.winner)}
                                alt={battle.winnerName}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                            <span className="text-emerald-400 text-sm">{battle.winnerName}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs italic text-white/90 mb-3 break-words">{battle.epicMoment}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col gap-1.5">
                          <Badge variant="outline" className="border border-red-500/30 text-red-400 whitespace-nowrap shadow-red-900/20 shadow-sm text-[10px] w-fit">
                            Loser
                          </Badge>
                          <span className="text-red-400/60 text-[10px]">{formatAddress(battle.loser)}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Badge variant="outline" className="border border-emerald-500/30 text-emerald-400 whitespace-nowrap shadow-emerald-900/20 shadow-sm text-[10px] w-fit ml-auto">
                            Winner
                          </Badge>
                          <span className="text-emerald-400/60 text-[10px] text-right">{formatAddress(battle.winner)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
}