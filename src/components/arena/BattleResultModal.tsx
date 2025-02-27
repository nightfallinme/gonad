'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { contracts } from '@/config/contracts';
import { Swords, Crown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGladiatorImages } from '@/hooks/useGladiatorImages';


interface BattleResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  hash?: `0x${string}`;
  result?: {
    winner: `0x${string}`;
    loser: `0x${string}`;
    epicMoment: string;
    reward: bigint;
    battleId: bigint;
    rarity: number;
  } | null;
  playerAddress?: `0x${string}`;
  isWaitingForEvent: boolean;
}

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

const RARITY_COLORS = {
  0: "text-neutral-400", // Common
  1: "text-green-400",   // Uncommon
  2: "text-blue-400",    // Rare
  3: "text-purple-400",  // Epic
  4: "text-yellow-400"   // Legendary
};

const RARITY_NAMES = {
  0: "Common",
  1: "Uncommon", 
  2: "Rare",
  3: "Epic",
  4: "Legendary"
};

export function BattleResultModal({
  isOpen,
  onClose,
  hash,
  result,
  playerAddress,
  isWaitingForEvent
}: BattleResultModalProps) {
  const { getGladiatorImage } = useGladiatorImages();
  const { 
    isLoading: isWaiting,
    isError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Read winner gladiator
  const { data: winner } = useReadContract({
    ...contracts.gladiatorArena,
    functionName: 'getGladiator',
    args: [result?.winner],
    query: {
      enabled: !!result?.winner,
    }
  }) as { data: Gladiator };

  // Read loser gladiator
  const { data: loser } = useReadContract({
    ...contracts.gladiatorArena,
    functionName: 'getGladiator',
    args: [result?.loser],
    query: {
      enabled: !!result?.loser,
    }
  }) as { data: Gladiator };

  const formatNumber = (value: bigint) => {
    return (Number(value) / 1e18).toLocaleString();
  };

  // Loading state'i event'in gelip gelmediğine göre güncelle
  const showLoadingState = isWaiting || isWaitingForEvent || (!result && !isError);
  const showResultState = result && winner && loser && !isWaiting && !isWaitingForEvent;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-black/95 border border-[#826ef8]/20 backdrop-blur-none">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white">
            {isWaiting ? "⚔️ Epic Battle in Progress!" : 
             isWaitingForEvent ? "⚔️ Calculating Results..." :
             showResultState ? "🎉 Battle Complete!" :
             isError ? "💀 Battle Failed!" : "⚔️ Preparing Battle..."}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4 space-y-6">
          {/* Loading State */}
          {showLoadingState && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Swords className="h-16 w-16 animate-[spin_3s_linear_infinite] text-[#826ef8]" />
                <Crown className="h-8 w-8 animate-bounce text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-lg font-bold text-white animate-pulse">
                {isWaiting ? "Battle in Progress..." : 
                 isWaitingForEvent ? "Calculating Results..." :
                 "Preparing Battle..."}
              </p>
              <p className="text-base text-[#826ef8] text-center">
                {isWaiting ? (
                  <>
                    Two gladiators enter, one emerges victorious!<br/>
                    Who will claim the GONAD rewards?<br/>
                    Place your bets ser!
                  </>
                ) : isWaitingForEvent ? (
                  <>
                    The battle is over!<br/>
                    Calculating rewards and experience...<br/>
                    Stay tuned ser!
                  </>
                ) : (
                  "Getting ready for an epic battle..."
                )}
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center space-y-4">
              <Crown className="h-16 w-16 text-red-500 mx-auto" />
              <p className="text-lg font-bold text-red-400">
                Battle Failed!
              </p>
              <p className="text-base text-[#826ef8]">
                Something went wrong... Maybe:
                <ul className="list-disc list-inside mt-2">
                  <li>Not enough MON for gas</li>
                  <li>Transaction was rejected</li>
                  <li>Network issues</li>
                </ul>
              </p>
            </div>
          )}

          {/* Success State with Results */}
          {showResultState && winner && loser && result && (
            <div className="space-y-6 w-full">
              {/* Gladiator Images */}
              <div className="relative flex justify-between items-center px-8">
                {/* Winner */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg shadow-yellow-500/50">
                    <img
                      src={getGladiatorImage(result.winner)}
                      alt={winner.name}
                      className="w-full h-full object-cover scale-110 hover:scale-125 transition-transform"
                    />
                  </div>
                  <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-500 animate-bounce" />
                </div>

                {/* VS Text */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <Swords className="h-8 w-8 text-[#826ef8] animate-pulse" />
                </div>

                {/* Loser */}
                <div className="relative opacity-75">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-500/50 shadow-lg shadow-red-500/20 grayscale relative">
                    <img
                      src={getGladiatorImage(result.loser)}
                      alt={loser.name}
                      className="w-full h-full object-cover"
                    />
                    <X className="absolute inset-0 w-full h-full text-red-600 stroke-[3] opacity-100" />
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "text-xl font-bold text-center p-2 rounded-lg",
                RARITY_COLORS[result.rarity as keyof typeof RARITY_COLORS],
                "bg-gradient-to-r from-black/50 to-transparent backdrop-blur-sm"
              )}>
                {RARITY_NAMES[result.rarity as keyof typeof RARITY_NAMES]} Battle!
              </div>

              <div className="text-center space-y-2 bg-black/40 p-4 rounded-lg backdrop-blur-none border border-[#826ef8]/20">
                <p className="text-xl font-bold text-white">
                  {result.epicMoment}
                </p>
                <p className="text-lg font-semibold text-purple-400">
                  {winner.name} {playerAddress === result.winner ? "wins!" : "defeats you!"}
                </p>
              </div>

              <div className="space-y-4 bg-black/40 p-4 rounded-lg backdrop-blur-none border border-[#826ef8]/20">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">GONAD Earned:</span>
                    <p className="font-bold text-[#826ef8]">+{formatNumber(result.reward)} GONAD</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#826ef8]/20">
                  <p className="text-sm italic text-center text-white/80">
                    &ldquo;{winner.battleCry}&rdquo;
                  </p>
                </div>
              </div>

              <div className="text-center text-sm text-white/60">
                Another epic victory in the GONAD Arena! 
                Keep grinding for more rewards! 💪
              </div>

              {hash && (
                <a
                  href={`https://testnet.monadexplorer.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm text-[#826ef8] hover:text-[#826ef8]/80 transition-colors"
                >
                  View Battle Details ↗
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 