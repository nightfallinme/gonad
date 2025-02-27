'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Swords } from "lucide-react";
import { useGladiatorImages } from '@/hooks/useGladiatorImages';

interface GladiatorCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  gladiator?: {
    name: string;
    strength: number;
    agility: number;
    vitality: number;
    intelligence: number;
    defense: number;
    battleCry: string;
  };
}

const EPIC_TITLES = [
  "WAGMI! A New Chad Has Risen! 🌟",
  "No FOMO, Welcome to the Arena! ⚔️",
  "Fresh Meat Just Dropped Ser! 🥩",
  "GONAD Warrior Ready to Moon! 💪",
  "DYOR and HODL! 🔥",
  "Born to be SAFU! 👊",
  "Make Way for Arena's New Whale! 👑",
  "Forged in GONAD! ⚡",
  "Pump It Up! 🎮",
  "Time to REKT the NGMI's! 💥"
];

export function GladiatorCreatedModal({ isOpen, onClose, gladiator }: GladiatorCreatedModalProps) {
  const { getGladiatorImage } = useGladiatorImages();

  if (!isOpen || !gladiator) return null;

  const randomTitle = EPIC_TITLES[Math.floor(Math.random() * EPIC_TITLES.length)];

  const getStatColor = (value: number) => {
    if (value >= 25) return "text-emerald-400"; // Legendary (25-30)
    if (value >= 20) return "text-blue-400";    // Epic (20-24)
    if (value >= 15) return "text-purple-400";  // Rare (15-19)
    if (value >= 10) return "text-yellow-400";  // Uncommon (10-14)
    return "text-neutral-400";                  // Common (0-9)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#1A0B2E] to-black border-[#826ef8]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-[#826ef8] to-purple-400 text-transparent bg-clip-text">
            ✨ Gladiator Forged!
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#826ef8]/50">
              <img
                src={getGladiatorImage('default')}
                alt="GONAD Gladiator"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2">
              <div className="relative">
                <Swords className="w-8 h-8 text-[#826ef8]" />
                <div className="absolute inset-0 bg-[#826ef8]/20 rounded-full filter blur-[8px] animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-[#826ef8] to-purple-400 text-transparent bg-clip-text animate-pulse">
              {randomTitle}
            </p>
            <p className="text-lg font-semibold text-[#826ef8]">
              {gladiator.name} has entered the arena!
            </p>
          </div>

          <div className="space-y-4 bg-black/40 backdrop-blur p-6 rounded-lg w-full border border-[#826ef8]/20">
            <div className="grid grid-cols-2 gap-6 text-base">
              <div>
                <span className="text-neutral-400">Strength:</span>
                <p className={`text-xl font-bold ${getStatColor(gladiator.strength)}`}>
                  {gladiator.strength}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Agility:</span>
                <p className={`text-xl font-bold ${getStatColor(gladiator.agility)}`}>
                  {gladiator.agility}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Vitality:</span>
                <p className={`text-xl font-bold ${getStatColor(gladiator.vitality)}`}>
                  {gladiator.vitality}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Intelligence:</span>
                <p className={`text-xl font-bold ${getStatColor(gladiator.intelligence)}`}>
                  {gladiator.intelligence}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Defense:</span>
                <p className={`text-xl font-bold ${getStatColor(gladiator.defense)}`}>
                  {gladiator.defense}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#826ef8]/20">
              <p className="text-base italic text-center text-[#826ef8]/90 font-medium">
                &ldquo;{gladiator.battleCry}&rdquo;
              </p>
            </div>
          </div>

          <div className="text-center text-sm">
            <p className="text-[#826ef8]">
              Your gladiator is ready ser! 
              <span className="block mt-1 text-neutral-400">
                Head to the arena and start farming GONAD! 🚀
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 