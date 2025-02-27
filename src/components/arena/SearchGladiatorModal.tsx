'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Search, Trophy } from "lucide-react";
import { useGladiators } from '@/contexts/GladiatorContext';
import { useAccount } from 'wagmi';

interface Gladiator {
  name: string;
  level: number;
  wins: number;
  losses: number;
  winStreak: number;
}

interface GladiatorWithData {
  address: `0x${string}`;
  gladiator: Gladiator;
  earnings: bigint;
}

interface SearchGladiatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: `0x${string}`) => void;
}

export function SearchGladiatorModal({ isOpen, onClose, onSelect }: SearchGladiatorModalProps) {
  const { address } = useAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedGladiators, setDisplayedGladiators] = useState<GladiatorWithData[]>([]);
  const { gladiators, isLoading, error } = useGladiators();

  // Arama terimi değiştiğinde filtreleme yap
  useEffect(() => {
    // Önce kendi gladyatörünü filtrele
    const filteredGladiators = gladiators.map(g => ({
      ...g,
      isActive: true, // All gladiators from context are active
    }));

    if (searchTerm.trim() === '') {
      // Arama yoksa, tüm listeyi göster (earnings'e göre sıralı)
      setDisplayedGladiators(filteredGladiators);
    } else {
      const searchLower = searchTerm.toLowerCase();
      
      // Arama varsa, tüm kriterlere göre filtreleme yap
      const filtered = filteredGladiators.filter(entry => {
        // İsim araması
        const nameMatch = entry.gladiator.name.toLowerCase().includes(searchLower);
        
        // Level araması (örn: "lvl 5" veya "level 5")
        const levelMatch = searchLower.includes('lvl') || searchLower.includes('level') 
          ? entry.gladiator.level.toString() === searchLower.replace(/[^0-9]/g, '')
          : false;

        // Kazanç araması (örn: "100g" veya "100 gonad")
        const earningsMatch = searchLower.includes('g') || searchLower.includes('gonad')
          ? Math.floor(Number(entry.earnings) / 1e18).toString() === searchLower.replace(/[^0-9]/g, '')
          : false;

        // Win sayısı araması (örn: "10w" veya "10 wins")
        const winsMatch = searchLower.includes('w') || searchLower.includes('win')
          ? entry.gladiator.wins.toString() === searchLower.replace(/[^0-9]/g, '')
          : false;

        // Win streak araması (örn: "5s" veya "5 streak")
        const streakMatch = searchLower.includes('s') || searchLower.includes('streak')
          ? entry.gladiator.winStreak.toString() === searchLower.replace(/[^0-9]/g, '')
          : false;

        // Herhangi bir kriter eşleşirse göster
        return nameMatch || levelMatch || earningsMatch || winsMatch || streakMatch;
      });

      setDisplayedGladiators(filtered);
    }
  }, [searchTerm, gladiators, address]);

  const handleSelect = (address: `0x${string}`) => {
    onSelect(address);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border border-[#826ef8]/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
            {searchTerm ? 'Search Results' : 'Top Earning Gladiators'}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            placeholder="Search by name, level (lvl5), wins (10w), streak (5s), earnings (100g)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/50 border-[#826ef8]/20 text-white placeholder:text-white/50"
          />
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#826ef8]" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">
                Failed to load gladiators
              </div>
            ) : displayedGladiators.length === 0 ? (
              <div className="text-center text-white/50 py-4">
                No gladiators found
              </div>
            ) : (
              displayedGladiators.map((entry, index) => (
                <div
                  key={entry.address}
                  onClick={() => handleSelect(entry.address)}
                  className="p-3 mx-1 rounded-lg border border-[#826ef8]/20 bg-black/50 hover:bg-[#826ef8]/10 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {!searchTerm && index < 3 && (
                          <Trophy className={`w-4 h-4 ${
                            index === 0 ? "text-yellow-500" :
                            index === 1 ? "text-neutral-400" :
                            "text-amber-700"
                          }`} />
                        )}
                        <h3 className="font-medium text-white">{entry.gladiator.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-sm text-neutral-400">
                          <Crown className="w-3 h-3 text-[#826ef8]" />
                          Level {entry.gladiator.level}
                        </div>
                        <div className="text-[#826ef8] text-sm">
                          {Number(entry.earnings) / 1e18} GONAD
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 text-sm">{entry.gladiator.wins} Wins</div>
                      <div className="text-[#826ef8] text-sm">{entry.gladiator.winStreak}🔥 Streak</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 