'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { useWalletClient } from 'wagmi';
import { GladiatorCard } from './GladiatorCard';
import { contracts } from '@/config/contracts';
import { BattleResultModal } from './BattleResultModal';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, Skull, Crown, Trophy, Search, Loader2, X } from "lucide-react";
import { SearchGladiatorModal } from './SearchGladiatorModal';
import { LeaderBoard } from './LeaderBoard';
import { useGladiatorImages } from '@/hooks/useGladiatorImages';
import { publicClient } from '@/lib/viem';
import { simulateContract, waitForTransactionReceipt } from 'viem/actions';
import { decodeEventLog } from 'viem';

interface BattleCompletedEvent {
  winner: `0x${string}`;
  loser: `0x${string}`;
  epicMoment: string;
  reward: bigint;
  battleId: bigint;
  rarity: number;
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

export function BattleArena() {
  const { address } = useAccount();
  const { getGladiatorImage } = useGladiatorImages();
  const { data: walletClient } = useWalletClient();
  const [selectedOpponent, setSelectedOpponent] = useState<`0x${string}`>();
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [battleTxHash, setBattleTxHash] = useState<`0x${string}`>();
  const [isBattleLoading, setIsBattleLoading] = useState(false);
  const [isWaitingForEvent, setIsWaitingForEvent] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'battle'>('leaderboard');
  const [battleResult, setBattleResult] = useState<{
    winner: `0x${string}`;
    loser: `0x${string}`;
    epicMoment: string;
    reward: bigint;
    battleId: bigint;
    rarity: number;
  } | null>(null);
  const { toast } = useToast();

  // Rakip seçildiğinde otomatik olarak battle tab'ına geç
  useEffect(() => {
    if (selectedOpponent) {
      setActiveTab('battle');
    }
  }, [selectedOpponent]);

  // Read player's gladiator
  const { data: playerGladiator } = useReadContract({
    ...contracts.gladiatorArena,
    functionName: 'getGladiator',
    args: [address],
  }) as { data: Gladiator };

  // Read opponent's gladiator
  const { data: opponentGladiator } = useReadContract({
    ...contracts.gladiatorArena,
    functionName: 'getGladiator',
    args: [selectedOpponent],
    query: {
      enabled: !!selectedOpponent,
    }
  }) as { data: Gladiator };

  // Watch battle events
  useWatchContractEvent({
    ...contracts.gladiatorArena,
    eventName: 'BattleResult',
    onLogs(logs) {
      const log = logs[0];
      console.log('Received battle event log:', log);
      console.log('Current battleTxHash:', battleTxHash);
      
      if (!log || !log.topics || log.topics.length < 1) {
        console.log('Invalid log format:', log);
        return;
      }

      try {
        // Event verilerini decode et
        const decodedData = decodeEventLog({
          abi: contracts.gladiatorArena.abi,
          data: log.data,
          topics: log.topics,
          strict: false
        });

        console.log('Decoded event data:', decodedData);

        if (!decodedData || !decodedData.args) {
          console.log('Failed to decode event data');
          return;
        }

        const eventData = decodedData.args as unknown as BattleCompletedEvent;
        console.log('Battle event data:', eventData);
        
        // Event verilerini kontrol et
        if (eventData.winner && eventData.loser) {
          console.log('Valid battle event received:', {
            winner: eventData.winner,
            loser: eventData.loser,
            txHash: log.transactionHash,
            battleTxHash
          });

          // Sadece battleTxHash ile eşleşen event'leri işle
          if (battleTxHash && log.transactionHash === battleTxHash) {
            console.log('Setting battle result:', eventData);
            setBattleResult({
              winner: eventData.winner,
              loser: eventData.loser,
              epicMoment: eventData.epicMoment,
              reward: eventData.reward,
              battleId: eventData.battleId,
              rarity: eventData.rarity
            });
            setIsWaitingForEvent(false);

            toast({
              title: "Battle Complete! 🏆",
              description: "Check the results ser! Did you win or get rekt?",
            });
          } else {
            console.log('Transaction hash mismatch:', {
              eventTxHash: log.transactionHash,
              battleTxHash
            });
          }
        } else {
          console.log('Invalid event data - missing winner or loser:', eventData);
        }
      } catch (error) {
        console.error('Failed to decode battle event:', error);
        console.log('Error details:', {
          log,
          topics: log.topics,
          data: log.data
        });
      }
    },
  });

  const handleChallenge = async (opponent: `0x${string}`) => {
    if (!walletClient || !address) {
      toast({
        variant: "destructive",
        title: "Anon Detected! 💀",
        description: "Connect wallet first ser! Don't be ngmi!",
      });
      return;
    }

    setIsBattleLoading(true);
    setIsWaitingForEvent(false);
    setBattleResult(null);
    try {
      setSelectedOpponent(opponent);
      
      // Önce savaşı simüle et
      let simulateResult;
      try {
        simulateResult = await simulateContract(publicClient, {
          ...contracts.gladiatorArena,
          functionName: 'fight',
          account: address,
          args: [opponent],
        });
      } catch (error) {
        console.error('Battle simulation error:', error);
        toast({
          variant: "destructive",
          title: "Battle Rekt! 💀",
          description: error instanceof Error ? error.message : "Ser you got rugged! Try again!",
        });
        return;
      }

      // İmzalama için kullanıcıya bildirim göster
      toast({
        title: "Sign For Glory! ⚔️",
        description: "Sign the tx ser! Your battle awaits!",
      });

      // Savaş işlemini başlat
      let hash;
      try {
        hash = await walletClient.writeContract(simulateResult.request);
      } catch (error) {
        if (error instanceof Error && error.message.includes('User rejected the request')) {
          toast({
            variant: "destructive",
            title: "Paper Hands! 🧻",
            description: "Ser got scared and ran away from battle!",
          });
          return;
        }
        toast({
          variant: "destructive",
          title: "Battle Failed! 💀",
          description: error instanceof Error ? error.message : "Ser you got rugged! Try again!",
        });
        return;
      }

      // Hash'i set et ve modalı göster
      setBattleTxHash(hash);
      setShowBattleModal(true);
      setIsWaitingForEvent(true);

      // İşlem onayı beklenirken bildirim göster
      toast({
        title: "LETS FIGHT! ⚔️",
        description: "Your chad gladiator is entering the arena! Time to get REKT or get RICH! 🚀"
      });

      // İşlem onayını bekle
      const receipt = await waitForTransactionReceipt(publicClient, { hash });
      console.log('Transaction receipt:', receipt);
      
      if (receipt.status === 'success') {
        // Battle event'ini bul
        const battleEvent = receipt.logs.find(log => {
          console.log('Checking log:', log);
          
          if (!log.topics || log.topics.length === 0) {
            console.log('Invalid log format - no topics');
            return false;
          }
          
          const eventTopic = log.topics[0];
          console.log('Event topic:', eventTopic);
          
          // BattleResult event topic'i
          const BATTLE_RESULT_TOPIC = '0x083bdfa41153d55fd12cfa645fa96a3a9a8e9f0ce4945a677427921e7f2c74dc';
          
          console.log('Comparing topics:', {
            received: eventTopic,
            expected: BATTLE_RESULT_TOPIC,
            matches: eventTopic === BATTLE_RESULT_TOPIC
          });

          return eventTopic === BATTLE_RESULT_TOPIC;
        });

        console.log('Battle event search result:', battleEvent);

        if (battleEvent) {
          try {
            // Event verilerini decode et
            const decodedData = decodeEventLog({
              abi: contracts.gladiatorArena.abi,
              data: battleEvent.data,
              topics: battleEvent.topics,
              strict: false
            });

            console.log('Decoded battle event:', decodedData);

            const eventData = decodedData.args as unknown as BattleCompletedEvent;
            console.log('Battle event data:', eventData);
            
            if (eventData.winner && eventData.loser) {
              console.log('Setting battle result from receipt:', eventData);
              // Event verilerini set et
              setBattleResult({
                winner: eventData.winner,
                loser: eventData.loser,
                epicMoment: eventData.epicMoment,
                reward: eventData.reward,
                battleId: eventData.battleId,
                rarity: eventData.rarity
              });
              setIsWaitingForEvent(false);

              // Toast mesajını güncelle
              toast({
                title: "Battle Complete! 🏆",
                description: "Check the results ser! Did you win or get rekt?",
              });
            } else {
              console.log('Invalid event data from receipt - missing winner or loser:', eventData);
            }
          } catch (error) {
            console.error('Failed to decode battle event from receipt:', error);
            setIsWaitingForEvent(false);
            toast({
              variant: "destructive",
              title: "Battle Data Error! 💀",
              description: "Failed to decode battle results. Try refreshing...",
            });
          }
        } else {
          console.log('Battle event not found in receipt logs');
          // Event bulunamadıysa 5 saniye bekle ve tekrar dene
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Event hala gelmemişse kullanıcıya bildir
          if (!battleResult) {
            console.log('Still no battle result after waiting');
            toast({
              title: "Waiting for Battle Event... ⏳",
              description: "Transaction confirmed, waiting for battle results...",
            });
          }
        }
      } else {
        setIsWaitingForEvent(false);
        setBattleResult(null);
        toast({
          variant: "destructive",
          title: "Battle Failed! 💀",
          description: "Something went wrong ser! Check your wallet!",
        });
      }

    } catch (error) {
      console.error('Failed to start battle:', error);
      toast({
        variant: "destructive",
        title: "Anon Down! 😵",
        description: error instanceof Error ? error.message : "Ser got rekt before the battle even started! Touch grass and come back stronger! 🌱"
      });
    } finally {
      setIsBattleLoading(false);
    }
  };

  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <CardHeader className="p-3 pb-2">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative">
            <Swords className="w-6 h-6 text-[#826ef8]" />
            <div className="absolute inset-0 bg-[#826ef8]/20 rounded-full filter blur-[8px] animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
              Battle Arena
            </CardTitle>
            <CardDescription>
              Challenge opponents and earn GONAD
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Tab Navigasyon */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-black/20 rounded-lg p-1 border border-[#826ef8]/20">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === 'leaderboard' 
                ? 'bg-[#826ef8] text-white' 
                : 'text-white/60 hover:bg-[#826ef8]/10'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('battle')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === 'battle' 
                ? 'bg-[#826ef8] text-white' 
                : 'text-white/60 hover:bg-[#826ef8]/10'
            }`}
          >
            Battle
          </button>
        </div>
      </div>

      <CardContent className="space-y-4 px-2">
        {activeTab === 'leaderboard' ? (
          <LeaderBoard 
            onSelect={(opponent) => {
              setSelectedOpponent(opponent);
              setActiveTab('battle');
            }} 
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Player's Gladiator */}
            {playerGladiator && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#826ef8]/10 to-transparent rounded-xl" />
                <div className="relative">
                  <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="relative">
                      <Crown className="w-6 h-6 text-[#826ef8]" />
                      <div className="absolute inset-0 bg-[#826ef8]/20 rounded-full filter blur-[8px] animate-pulse" />
                    </div>
                    <div className="absolute -right-2 -top-2">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#826ef8]/20">
                        <img
                          src={getGladiatorImage(address!)}
                          alt={playerGladiator.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white [text-shadow:_0_0_1px_#826ef8]">Your Gladiator</h3>
                  </div>
                  <GladiatorCard
                    name={playerGladiator.name}
                    level={Number(playerGladiator.level)}
                    experience={Number(playerGladiator.experience)}
                    wins={Number(playerGladiator.wins)}
                    losses={Number(playerGladiator.losses)}
                    winStreak={Number(playerGladiator.winStreak)}
                    battleCry={playerGladiator.battleCry}
                    stats={{
                      strength: Number(playerGladiator.strength),
                      agility: Number(playerGladiator.agility),
                      vitality: Number(playerGladiator.vitality),
                      intelligence: Number(playerGladiator.intelligence),
                      defense: Number(playerGladiator.defense),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Opponent's Gladiator */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-xl" />
              <div className="relative">
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="relative">
                    <Skull className="w-6 h-6 text-red-500" />
                    <div className="absolute inset-0 bg-red-500/20 rounded-full filter blur-[8px] animate-pulse" />
                  </div>
                  {opponentGladiator && (
                    <div className="absolute -left-2 -top-2">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500/20">
                        <img
                          src={getGladiatorImage(selectedOpponent!)}
                          alt={opponentGladiator.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 z-10">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOpponent(undefined);
                          }}
                          className="w-6 h-6 p-0 rounded-full bg-red-500/80 hover:bg-red-600 text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-white [text-shadow:_0_0_1px_rgb(239_68_68)]">Opponent</h3>
                </div>
                {opponentGladiator ? (
                  <>
                    <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 z-10">
                      <div className="relative">
                        <Swords className="w-8 h-8 text-[#826ef8] animate-[pulse_0.5s_ease-in-out_infinite]" />
                        <div className="absolute inset-0 bg-[#826ef8]/20 rounded-full filter blur-[8px] animate-[pulse_0.5s_ease-in-out_infinite]" />
                      </div>
                    </div>
                    <div 
                      onClick={() => setShowSearchModal(true)}
                      className="relative cursor-pointer group"
                    >
                      <GladiatorCard
                        name={opponentGladiator.name}
                        level={Number(opponentGladiator.level)}
                        experience={Number(opponentGladiator.experience)}
                        wins={Number(opponentGladiator.wins)}
                        losses={Number(opponentGladiator.losses)}
                        winStreak={Number(opponentGladiator.winStreak)}
                        battleCry={opponentGladiator.battleCry}
                        stats={{
                          strength: Number(opponentGladiator.strength),
                          agility: Number(opponentGladiator.agility),
                          vitality: Number(opponentGladiator.vitality),
                          intelligence: Number(opponentGladiator.intelligence),
                          defense: Number(opponentGladiator.defense),
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                        <Button
                          variant="outline"
                          className="bg-[#826ef8]/10 border-[#826ef8]/50 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white gap-2"
                        >
                          <Search className="w-4 h-4" />
                          Change Opponent
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Card className="w-full bg-transparent border border-white/10 shadow-none rounded-xl">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                      <Trophy className="w-12 h-12 text-red-500 drop-shadow-[0_0_2px_rgb(239_68_68)] mb-4" />
                      <p className="text-lg font-medium text-white [text-shadow:_0_0_1px_rgb(239_68_68)] text-center mb-2">
                        Select an Opponent
                      </p>
                      <p className="text-sm text-white/90 text-center mb-4">
                        Choose your next challenger from the leaderboard below
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowSearchModal(true);
                          setActiveTab('leaderboard');
                        }}
                        className="bg-black/20 border-red-500/20 text-white hover:bg-red-500/10 hover:border-red-500/40 gap-2"
                      >
                        <Search className="w-4 h-4" />
                        Search Gladiator
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Challenge Button */}
        {activeTab === 'battle' && selectedOpponent && opponentGladiator && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => handleChallenge(selectedOpponent)}
              disabled={isBattleLoading}
              className="w-[300px] h-12 bg-gradient-to-r from-[#826ef8] to-[#826ef8]/80 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              {isBattleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Battling...
                </>
              ) : (
                'Challenge to Battle'
              )}
            </Button>
          </div>
        )}

        {activeTab === 'battle' && !opponentGladiator && (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#826ef8]/20 rounded-xl bg-black/20">
            <Trophy className="w-12 h-12 text-[#826ef8] drop-shadow-[0_0_2px_#826ef8]" />
            <p className="text-lg font-medium text-white [text-shadow:_0_0_1px_#826ef8] text-center mb-2">
              Ready to Fight?
            </p>
            <p className="text-sm text-white/90 text-center mb-6">
              Find your next opponent
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSearchModal(true);
                  setActiveTab('leaderboard');
                }}
                className="bg-[#826ef8]/10 border-[#826ef8]/50 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white gap-2"
              >
                <Search className="w-4 h-4" />
                Search Gladiator
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('leaderboard')}
                className="bg-[#826ef8]/10 border-[#826ef8]/50 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white gap-2"
              >
                <Trophy className="w-4 h-4" />
                View Leaderboard
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <BattleResultModal
        isOpen={showBattleModal}
        onClose={() => {
          setShowBattleModal(false);
          setBattleResult(null);
          setIsWaitingForEvent(false);
        }}
        hash={battleTxHash}
        result={battleResult}
        playerAddress={address as `0x${string}`}
        isWaitingForEvent={isWaitingForEvent}
      />

      <SearchGladiatorModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={(opponent) => {
          setSelectedOpponent(opponent);
          setActiveTab('battle');
          setShowSearchModal(false);
        }}
      />
    </Card>
  );
} 