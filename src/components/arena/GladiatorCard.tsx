'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skull } from "lucide-react";
import { cn } from "@/lib/utils";

interface GladiatorStats {
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  defense: number;
}

interface GladiatorCardProps {
  name: string;
  level: number;
  experience: number;
  wins: number;
  losses: number;
  winStreak: number;
  battleCry: string;
  stats: GladiatorStats;
  onChallenge?: () => void;
  onKill?: () => void;
  showStats?: boolean;
  showKillButton?: boolean;
  isKillDisabled?: boolean;
}

export function GladiatorCard({
  name,
  level,
  experience,
  wins,
  losses,
  winStreak,
  battleCry,
  stats,
  onChallenge,
  onKill,
  showStats = true,
  showKillButton = false,
  isKillDisabled = false
}: GladiatorCardProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout>();
  const [killProgress, setKillProgress] = useState(0);
  const LONG_PRESS_DURATION = 1000; // 1 second for long press

  const handleMouseDown = () => {
    if (isKillDisabled || !showKillButton) return;
    
    const timer = setTimeout(() => {
      onKill?.();
    }, LONG_PRESS_DURATION);
    
    setLongPressTimer(timer);

    // Start progress animation
    setKillProgress(0);
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed / LONG_PRESS_DURATION) * 100;
      
      if (progress <= 100) {
        setKillProgress(progress);
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(undefined);
    }
    setKillProgress(0);
  };

  const xpForNextLevel = level * 100;
  const xpProgress = (experience / xpForNextLevel) * 100;

  return (
    <Card className="w-full bg-transparent border border-white/10 shadow-none rounded-xl">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <CardTitle className="text-2xl font-bold text-white/90">
              {name}
            </CardTitle>
            {showKillButton && (
              <div className="relative">
                <button
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchEnd={handleMouseUp}
                  disabled={isKillDisabled}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg",
                    "bg-red-500/10 border border-red-500/20",
                    "text-sm font-normal text-red-400 hover:bg-red-500/20",
                    isKillDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Skull className="w-3.5 h-3.5" />
                  <span className="text-xs">Hold to Kill</span>
                  {killProgress > 0 && (
                    <div 
                      className="absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-75"
                      style={{ width: `${killProgress}%` }}
                    />
                  )}
                </button>
              </div>
            )}
          </div>
          <CardDescription className="text-[#826ef8]/90">Level {level} Gladiator</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {/* Experience Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">XP Progress</span>
            <span className="text-[#826ef8]">{Math.floor(xpProgress)}%</span>
          </div>
          <Progress 
            value={xpProgress} 
            className="h-2 bg-black/60 border border-[#826ef8]/20 rounded-lg overflow-hidden" 
            indicatorClassName="bg-gradient-to-r from-[#826ef8] to-[#826ef8]/80"
          />
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Strength</span>
                <span className="text-[#826ef8]">{stats.strength}</span>
              </div>
              <Progress 
                value={(stats.strength / 30) * 100} 
                className="h-2 bg-black/60 border border-[#826ef8]/20 rounded-lg overflow-hidden"
                indicatorClassName="bg-gradient-to-r from-[#826ef8] to-[#826ef8]/80"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Agility</span>
                <span className="text-[#826ef8]">{stats.agility}</span>
              </div>
              <Progress 
                value={(stats.agility / 30) * 100} 
                className="h-2 bg-black/60 border border-[#826ef8]/20 rounded-lg overflow-hidden"
                indicatorClassName="bg-gradient-to-r from-[#826ef8] to-[#826ef8]/80"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Vitality</span>
                <span className="text-[#826ef8]">{stats.vitality}</span>
              </div>
              <Progress 
                value={(stats.vitality / 30) * 100} 
                className="h-2 bg-black/60 border border-[#826ef8]/20 rounded-lg overflow-hidden"
                indicatorClassName="bg-gradient-to-r from-[#826ef8] to-[#826ef8]/80"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Intelligence</span>
                <span className="text-[#826ef8]">{stats.intelligence}</span>
              </div>
              <Progress 
                value={(stats.intelligence / 30) * 100} 
                className="h-2 bg-black/60 border border-[#826ef8]/20 rounded-lg overflow-hidden"
                indicatorClassName="bg-gradient-to-r from-[#826ef8] to-[#826ef8]/80"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Defense</span>
                <span className="text-[#826ef8]">{stats.defense}</span>
              </div>
              <Progress 
                value={(stats.defense / 30) * 100} 
                className="h-2 bg-black/60 border border-[#826ef8]/20 rounded-lg overflow-hidden"
                indicatorClassName="bg-gradient-to-r from-[#826ef8] to-[#826ef8]/80"
              />
            </div>
          </div>
        )}

        {/* Battle Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold text-[#826ef8]">{wins}</div>
            <div className="text-sm text-white/70">Wins</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#826ef8]">{losses}</div>
            <div className="text-sm text-white/70">Losses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#826ef8]">{winStreak}</div>
            <div className="text-sm text-white/70">Streak</div>
          </div>
        </div>

        {/* Battle Cry */}
        {battleCry && battleCry.trim() !== '' && (
          <div className="mt-2 p-2 bg-[#826ef8]/5 rounded-lg border border-[#826ef8]/20">
            <p className="italic text-sm text-white/90 break-words whitespace-normal">&ldquo;{battleCry}&rdquo;</p>
          </div>
        )}
      </CardContent>

      {onChallenge && (
        <CardFooter className="p-4 pt-0">
          <button
            onClick={onChallenge}
            className="w-full py-2 px-4 bg-gradient-to-r from-[#826ef8] to-[#826ef8]/80 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Challenge to Battle
          </button>
        </CardFooter>
      )}
    </Card>
  );
} 