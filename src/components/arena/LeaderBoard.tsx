'use client';

import { useState, useEffect } from 'react';
import { Trophy, Crown,  ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GladiatorImageModal } from './GladiatorImageModal';
import { useGladiators } from '@/contexts/GladiatorContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


enum LeaderboardType {
  MOST_WINS,
  HIGHEST_STREAK,
  MOST_EARNINGS,
  MOST_EFFICIENT
}

const GLADIATORS_PER_PAGE = 10;

interface LeaderboardProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelect?: (address: `0x${string}`) => void;
  isModal?: boolean;
}

interface LeaderboardEntry {
  address: `0x${string}`;
  gladiator: {
    name: string;
    level: number;
    wins: number;
    losses: number;
    winStreak: number;
  };
  earnings: bigint;
  totalFights: number;
  efficiency: number;
}

export function LeaderBoard({ isOpen, onClose, onSelect, isModal = false }: LeaderboardProps) {
  const { gladiators } = useGladiators();
  const [selectedType, setSelectedType] = useState<LeaderboardType>(LeaderboardType.MOST_WINS);
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGladiator, setSelectedGladiator] = useState<{ address: string; name: string } | null>(null);

  // Liderlik tablosunu hesapla
  const calculateLeaderboard = () => {
    const sortedGladiators = gladiators
      .filter(entry => entry.gladiator.level > 0)
      .map(entry => ({
        ...entry,
        totalFights: entry.gladiator.wins + entry.gladiator.losses,
        efficiency: entry.gladiator.wins > 0 
          ? Number(entry.earnings) / (entry.gladiator.wins + entry.gladiator.losses) / 1e18 
          : 0
      }))
      .sort((a, b) => {
        switch (selectedType) {
          case LeaderboardType.MOST_WINS:
            return b.gladiator.wins - a.gladiator.wins;
          case LeaderboardType.HIGHEST_STREAK:
            return b.gladiator.winStreak - a.gladiator.winStreak;
          case LeaderboardType.MOST_EARNINGS:
            return Number(b.earnings - a.earnings);
          case LeaderboardType.MOST_EFFICIENT:
            return b.efficiency - a.efficiency;
          default:
            return 0;
        }
      });

    const startIndex = (currentPage - 1) * GLADIATORS_PER_PAGE;
    const endIndex = startIndex + GLADIATORS_PER_PAGE;
    const paginatedGladiators = sortedGladiators.slice(startIndex, endIndex);

    setLeaderboard(paginatedGladiators);
    setTotalPages(Math.ceil(sortedGladiators.length / GLADIATORS_PER_PAGE));
  };

  // Gladyatörler değiştiğinde veya sayfa/tür seçildiğinde güncelle
  useEffect(() => {
    if (gladiators.length > 0) {
      calculateLeaderboard();
    }
  }, [gladiators, selectedType, currentPage]);

  
  const handleRowClick = (address: `0x${string}`) => {
    if (onSelect) {
      onSelect(address);
      onClose?.();
    }
  };


  const renderLeaderboard = () => (
    <div className={cn(
      "w-full p-0",
      !isModal && "bg-black/20 border border-[#826ef8]/20 rounded-xl p-4"
    )}>
      <div className="flex items-center justify-end mb-2">
        <div className="flex gap-2">
          {[
            { type: LeaderboardType.MOST_WINS, label: 'Wins' },
            { type: LeaderboardType.MOST_EARNINGS, label: 'Earnings' },
            { type: LeaderboardType.MOST_EFFICIENT, label: 'Efficiency' }
          ].map(({ type, label }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className={cn(
                "bg-black/20 border-[#826ef8]/20 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white",
                selectedType === type && "border-[#826ef8] bg-[#826ef8]/20"
              )}
              onClick={() => setSelectedType(type)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const rank = (currentPage - 1) * GLADIATORS_PER_PAGE + index + 1;
          const winRate = entry.totalFights > 0
            ? (entry.gladiator.wins / entry.totalFights * 100).toFixed(1)
            : '0.0';

          return (
            <div
              key={entry.address}
              onClick={() => handleRowClick(entry.address)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg bg-black/20 border border-[#826ef8]/20",
                "hover:border-[#826ef8] hover:bg-[#826ef8]/10 transition-colors cursor-pointer",
                rank <= 3 && "border-[#826ef8]/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8">
                  {rank <= 3 ? (
                    <Trophy className={cn(
                      "w-5 h-5",
                      rank === 1 && "text-yellow-500",
                      rank === 2 && "text-gray-400",
                      rank === 3 && "text-amber-600"
                    )} />
                  ) : (
                    <span className="text-white/90">{rank}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{entry.gladiator.name}</span>
                    <div className="flex items-center gap-1">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-white/90">{entry.gladiator.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span>{entry.gladiator.wins}W</span>
                    <span>{entry.gladiator.winStreak} streak</span>
                    <span>{winRate}% win rate</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {selectedType === LeaderboardType.MOST_WINS && (
                  <div className="text-sm font-medium text-white">
                    {entry.gladiator.wins} Total Wins
                  </div>
                )}
                {selectedType === LeaderboardType.HIGHEST_STREAK && (
                  <div className="text-sm font-medium text-white">
                    {entry.gladiator.winStreak} Win Streak
                  </div>
                )}
                {selectedType === LeaderboardType.MOST_EARNINGS && (
                  <div className="text-sm font-medium text-white">
                    {Number(entry.earnings / BigInt(1e18)).toLocaleString()} GONAD
                  </div>
                )}
                {selectedType === LeaderboardType.MOST_EFFICIENT && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {entry.efficiency.toFixed(2)} GONAD/fight
                    </div>
                    <div className="text-xs text-white/70">
                      {entry.gladiator.wins} Total Wins
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          className="bg-black/20 border-[#826ef8]/20 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-white/90">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          className="bg-black/20 border-[#826ef8]/20 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="bg-black/95 border-[#826ef8]/20 max-w-4xl h-[85vh] p-0 overflow-hidden">
            <DialogHeader className="px-6 py-3 border-b border-[#826ef8]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Trophy className="w-6 h-6 text-[#826ef8]" />
                    <div className="absolute inset-0 bg-[#826ef8]/20 rounded-full filter blur-[8px] animate-pulse" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
                      Leaderboard
                    </DialogTitle>
                    <p className="text-sm text-white/60 mt-1">
                      Select a gladiator to challenge them in the arena
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <ScrollArea className="h-[calc(85vh-120px)] w-full px-2 py-2">
              {renderLeaderboard()}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {selectedGladiator && (
          <GladiatorImageModal
            isOpen={!!selectedGladiator}
            onClose={() => setSelectedGladiator(null)}
            gladiatorAddress={selectedGladiator.address}
            gladiatorName={selectedGladiator.name}
          />
        )}
      </>
    );
  }

  return renderLeaderboard();
} 