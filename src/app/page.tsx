'use client';

import { ConnectWallet } from '@/components/ConnectWallet';
import { ForgeGladiator } from '@/components/arena/ForgeGladiator';
import { BattleArena } from '@/components/arena/BattleArena';
import { BattleLog } from '@/components/arena/BattleLog';
import { SocialFeatures } from '@/components/token/SocialFeatures';
import { SocialBoard } from '@/components/SocialBoard';
import { AboutNightfallModal } from '@/components/AboutNightfallModal';
import { useAccount } from 'wagmi';
import { Swords, Crown, Trophy, Coins, Gift,  MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Airdrop } from '@/components/token/Airdrop';
import { Presale } from '@/components/token/Presale';
import { FeatureCard } from '@/components/shared/FeatureCard';
import { GladiatorCreatedModal } from '@/components/arena/GladiatorCreatedModal';
import { publicClient } from '@/lib/viem';
import { contracts } from '@/config/contracts';

// Sayıyı formatla (1234 -> 1.2K)
const formatTokenAmount = (amount: bigint) => {
  const numAmount = Number(amount) / 1e18;
  if (numAmount >= 1000) {
    return `${(numAmount / 1000).toFixed(1)}K $GON`;
  }
  return `${numAmount.toFixed(1)} $GON`;
};

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

interface GladiatorModalData {
  name: string;
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  defense: number;
  battleCry: string;
}

export default function Home() {
  const { address } = useAccount();
  const [showAirdrop, setShowAirdrop] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showGladiatorModal, setShowGladiatorModal] = useState(false);
  const [showSocialBoard, setShowSocialBoard] = useState(false);
  const [showAboutNightfall, setShowAboutNightfall] = useState(false);
  const [gladiatorModalData, setGladiatorModalData] = useState<GladiatorModalData | undefined>();
  const [gladiator, setGladiator] = useState<Gladiator | null>(null);
  const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
  const [isHoveringTokenButton, setIsHoveringTokenButton] = useState(false);

  // Gladiator var mı kontrolü
  useEffect(() => {
    const fetchGladiator = async () => {
      if (!address) {
        setGladiator(null);
        return;
      }

      try {
        const gladiatorData = await publicClient.readContract({
          ...contracts.gladiatorArena,
          functionName: 'getGladiator',
          args: [address],
        }) as Gladiator;

        setGladiator(gladiatorData);
      } catch (error) {
        console.error('Failed to fetch gladiator:', error);
        setGladiator(null);
      }
    };

    fetchGladiator();
  }, [address]);

  // Token bakiyesini fetch et
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!address) {
        setTokenBalance(null);
        return;
      }

      try {
        const balance = await publicClient.readContract({
          ...contracts.gonadToken,
          functionName: 'balanceOf',
          args: [address],
        }) as bigint;

        setTokenBalance(balance);
      } catch (error) {
        console.error('Failed to fetch token balance:', error);
        setTokenBalance(null);
      }
    };

    fetchTokenBalance();
  }, [address]);

  useEffect(() => {
    if (showAirdrop || showBuyModal || showGladiatorModal || showSocialBoard || showAboutNightfall) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showAirdrop, showBuyModal, showGladiatorModal, showSocialBoard, showAboutNightfall]);

  return (
    <main className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-[#1A0B2E] to-[#0D0D0D]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-[#826ef8]/20 rounded-full filter blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-[#826ef8]/20 rounded-full filter blur-[150px] animate-pulse delay-1000" />
        </div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#826ef8]/20 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-[#826ef8] to-[#826ef8]/80 text-transparent bg-clip-text [text-shadow:_0_0_1px_rgb(255_255_255_/_50%)]">
              GONAD ARENA
            </h1>
            <p className="text-[10px] text-neutral-400 tracking-wider">
              gladiators of naked arena domination
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="bg-[#826ef8]/10 border-[#826ef8]/50 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white transition-all"
              onClick={() => setShowSocialBoard(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2 text-[#826ef8]" />
              <span className="text-white">Social Board</span>
            </Button>
            <Button
              variant="outline"
              className="bg-[#826ef8]/10 border-[#826ef8]/50 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white transition-all"
              onClick={() => setShowAirdrop(true)}
            >
              <Gift className="w-4 h-4 mr-2 text-[#826ef8]" />
              <span className="text-white">AIRDROP</span>
            </Button>
            <Button
              variant="outline" 
              className="bg-[#826ef8]/10 border-[#826ef8]/50 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white transition-all"
              onMouseEnter={() => setIsHoveringTokenButton(true)}
              onMouseLeave={() => setIsHoveringTokenButton(false)}
              onClick={() => setShowBuyModal(true)}
            >
              {!address ? (
                <>
                  <Coins className="w-4 h-4 mr-2 text-[#826ef8]" />
                  <span className="text-white">BUY GONAD</span>
                </>
              ) : isHoveringTokenButton ? (
                <>
                  <Coins className="w-4 h-4 mr-2 text-[#826ef8]" />
                  <span className="text-white">BUY GONAD</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2 text-[#826ef8]" />
                  <span className="text-white">
                    {tokenBalance !== null ? formatTokenAmount(tokenBalance) : 'Loading...'}
                  </span>
                </>
              )}
            </Button>
            <ConnectWallet />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-16">
        {!address ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#826ef8] to-[#826ef8]/60 blur-[100px] opacity-20" />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text relative">
                Welcome to GONAD Arena
              </h2>
            </div>
            <p className="max-w-2xl text-lg text-neutral-300 leading-relaxed">
              Connect your wallet to create your gladiator and join epic arena battles.
              Earn GONAD tokens, climb the leaderboards, and become a legend.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mt-12">
              <FeatureCard
                icon={<Swords className="w-8 h-8 text-[#826ef8]" />}
                title="Battle Arena"
                description="Challenge other gladiators in epic 1v1 battles"
              />
              <FeatureCard
                icon={<Crown className="w-8 h-8 text-[#826ef8]" />}
                title="Leaderboards"
                description="Climb the ranks and prove your dominance"
              />
              <FeatureCard
                icon={<Trophy className="w-8 h-8 text-[#826ef8]" />}
                title="Earn GONAD"
                description="Win battles to earn GONAD tokens"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Row - 3 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr,300px] gap-8">
              {/* Left Column - Gladiator Info & Social */}
              <div className="space-y-8">
                <div className="bg-black/20 backdrop-blur border border-[#826ef8]/20 rounded-xl">
                  <ForgeGladiator 
                    onGladiatorCreated={(gladiator) => {
                      setGladiatorModalData(gladiator);
                      setShowGladiatorModal(true);
                    }}
                  />
                </div>
                {gladiator && (
                  <div className="bg-black/20 backdrop-blur border border-[#826ef8]/20 rounded-xl">
                    <SocialFeatures />
                  </div>
                )}
              </div>

              {/* Middle Column - Battle Arena */}
              <div className="bg-black/20 backdrop-blur border border-[#826ef8]/20 rounded-xl">
                <BattleArena />
              </div>

              {/* Right Column - Battle Log */}
              <div className="bg-black/20 backdrop-blur rounded-xl max-h-[580px]">
                <BattleLog />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Dialog open={showAirdrop} onOpenChange={setShowAirdrop}>
        <DialogContent className="bg-gradient-to-br from-black to-[#1A0B2E] border-[#826ef8]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
              Claim GONAD Airdrop
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Claim your free GONAD tokens (once per day)
            </DialogDescription>
          </DialogHeader>
          <Airdrop />
        </DialogContent>
      </Dialog>

      <Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
        <DialogContent className="bg-gradient-to-br from-black to-[#1A0B2E] border-[#826ef8]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
              Buy GONAD Tokens
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Purchase GONAD tokens in the presale
            </DialogDescription>
          </DialogHeader>
          <Presale />
        </DialogContent>
      </Dialog>

      <GladiatorCreatedModal
        isOpen={showGladiatorModal}
        onClose={() => setShowGladiatorModal(false)}
        gladiator={gladiatorModalData}
      />

      {/* Social Board Modal */}
      <SocialBoard 
        isOpen={showSocialBoard} 
        onClose={() => setShowSocialBoard(false)} 
      />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-[#826ef8]/20 bg-black/50 backdrop-blur-xl py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-neutral-500">
            Built with <span className="text-red-500 animate-pulse">❤️</span> by 
            <span className="ml-1">
              the GONAD team
              <span className="ml-1 text-xs text-neutral-400">
                (oh btw GONAD team is only me - 
                <span 
                  onClick={() => setShowAboutNightfall(true)} 
                  className="ml-1 text-[#826ef8] hover:text-[#a855f7] hover:underline cursor-pointer"
                >
                  nightfall
                </span>)
              </span>
            </span> | 
            Powered by <span className="text-[#826ef8]">Monad</span>
          </p>
        </div>
      </footer>

      {/* About Nightfall Modal */}
      <AboutNightfallModal 
        isOpen={showAboutNightfall} 
        onClose={() => setShowAboutNightfall(false)} 
      />
    </main>
  );
}
