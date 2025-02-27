import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { type Hash } from 'viem';
import { contracts } from '@/config/contracts';
import { GladiatorCard } from './GladiatorCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sword, Crown, Trophy, Loader2, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGladiatorImages } from '@/hooks/useGladiatorImages';
import { useToast } from "@/components/ui/use-toast";
import { publicClient } from '@/lib/viem';
import { simulateContract, waitForTransactionReceipt } from 'viem/actions';
import { useGladiators } from '@/contexts/GladiatorContext';

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

interface TransactionState {
  isWaitingTx: boolean;
  isWaitingApprove: boolean;
  isWaitingKill: boolean;
}

interface ForgeGladiatorProps {
  onGladiatorCreated: (gladiator: {
    name: string;
    strength: number;
    agility: number;
    vitality: number;
    intelligence: number;
    defense: number;
    battleCry: string;
  }) => void;
}

export function ForgeGladiator({ onGladiatorCreated }: ForgeGladiatorProps) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const {getGladiator } = useGladiators();
  const [name, setName] = useState('');
  const [battleCry, setBattleCry] = useState('');
  const { getGladiatorImage, setGladiatorImage } = useGladiatorImages();
  const [imageUrl, setImageUrl] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [, setShowCreatedModal] = useState(false);
  const [createdTxHash, setCreatedTxHash] = useState<Hash>();
  const [isCreating, setIsCreating] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<Hash>();
  const [killTxHash, setKillTxHash] = useState<Hash>();
  const [isLoading, setIsLoading] = useState(true);
  const [gladiatorData, setGladiatorData] = useState<Gladiator | null>(null);
  const [isGladiator, setIsGladiator] = useState(false);
  const [txState, setTxState] = useState<TransactionState>({
    isWaitingTx: false,
    isWaitingApprove: false,
    isWaitingKill: false
  });
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<bigint>(BigInt(0));

  // Gladyatör bilgilerini getir
  const fetchGladiatorData = async () => {
    if (!address) return null;
    try {
      const data = await publicClient.readContract({
        ...contracts.gladiatorArena,
        functionName: 'getGladiator',
        args: [address],
      });
      return data as Gladiator;
    } catch (error) {
      console.error('Error fetching gladiator:', error);
      return null;
    }
  };

  // Gladyatör durumunu kontrol et
  const checkIsGladiator = async () => {
    if (!address) return false;
    try {
      const data = await publicClient.readContract({
        ...contracts.gladiatorArena,
        functionName: 'isGladiator',
        args: [address],
      });
      return data as boolean;
    } catch (error) {
      console.error('Error checking gladiator status:', error);
      return false;
    }
  };

  // GONAD bakiyesini kontrol et
  const checkGonadBalance = async () => {
    if (!address) return BigInt(0);
    try {
      const data = await publicClient.readContract({
        ...contracts.gonadToken,
        functionName: 'balanceOf',
        args: [address],
      });
      return data as bigint;
    } catch (error) {
      console.error('Error checking GONAD balance:', error);
      return BigInt(0);
    }
  };

  // GONAD allowance kontrol et
  const checkAllowance = async () => {
    if (!address) return BigInt(0);
    try {
      const data = await publicClient.readContract({
        ...contracts.gonadToken,
        functionName: 'allowance',
        args: [address, contracts.gladiatorArena.address],
      });
      return data as bigint;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return BigInt(0);
    }
  };

  // Kazançları kontrol et
  const checkEarnings = async () => {
    if (!address) return BigInt(0);
    try {
      const data = await publicClient.readContract({
        ...contracts.gladiatorArena,
        functionName: 'totalEarnings',
        args: [address],
      });
      return data as bigint;
    } catch (error) {
      console.error('Error checking earnings:', error);
      return BigInt(0);
    }
  };

  // Transaction durumunu kontrol et
  const checkTransactionStatus = async (hash: Hash) => {
    try {
      const receipt = await waitForTransactionReceipt(publicClient, { hash });
      return receipt.status === 'success';
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return false;
    }
  };

  // Kill işlemi
  const handleKillAfterApprove = async () => {
    try {
      if (!walletClient || !address) return;

      // Kill işlemini simüle et
      const { request } = await simulateContract(publicClient, {
        ...contracts.gladiatorArena,
        functionName: 'killGladiator',
        account: address,
      });

      toast({
        title: "Kill Transaction! ⚔️",
        description: "Sign the transaction to kill your gladiator.",
      });

      const hash = await walletClient.writeContract(request);
      setKillTxHash(hash);

      toast({
        title: "Kill Transaction Sent! ⏳",
        description: "Waiting for confirmation...",
      });

      const success = await checkTransactionStatus(hash);
      
      if (success) {
        toast({
          title: "WAGMI! Gladiator Ascended! 🔥",
          description: "Your chad died like a true degen! Time to forge another sigma!",
        });
        
        // Gladyatör bilgisini yenile
        await loadData();
        // İşlem durumlarını sıfırla
        setIsCreating(false);
        setShowCreatedModal(false);
      }
    } catch (error) {
      console.error('Kill transaction failed:', error);
      toast({
        variant: "destructive",
        title: "Execution Rugged! ❌",
        description: error instanceof Error ? error.message : "Ser your gladiator refused to get rekt!",
      });
      // Hata durumunda da state'leri sıfırla
      setIsCreating(false);
    }
  };

  // Gladyatör oluşturma simülasyonu
  const simulateCreateGladiator = async () => {
    if (!address || !name || !battleCry) return null;
    try {
      const result = await simulateContract(publicClient, {
        ...contracts.gladiatorArena,
        functionName: 'createGladiator',
        args: [name, battleCry],
        account: address,
      });
      return result;
    } catch (error) {
      console.error('Simulate create error:', error);
      return null;
    }
  };

  // Verileri yükle
  const loadData = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      // Önce GladiatorContext'ten kontrol et
      const existingGladiator = getGladiator(address);
      
      if (existingGladiator) {
        setGladiatorData(existingGladiator.gladiator);
        setIsGladiator(true);
        setEarnings(existingGladiator.earnings);
        setIsLoading(false);
        return;
      }

      // Context'te yoksa kontrat üzerinden kontrol et
      const [gladiator, isGlad, earningsData] = await Promise.all([
        fetchGladiatorData(),
        checkIsGladiator(),
        checkEarnings()
      ]);
      
      if (gladiator) setGladiatorData(gladiator as Gladiator);
      if (typeof isGlad === 'boolean') setIsGladiator(isGlad);
      if (earningsData) setEarnings(earningsData as bigint);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error Loading Data ❌",
        description: "Failed to load gladiator data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // İlk yükleme ve adres değiştiğinde verileri yenile
  useEffect(() => {
    loadData();
  }, [address]);

  // Transaction durumlarını takip et
  useEffect(() => {
    let isMounted = true;

    const checkTransaction = async () => {
      if (!createdTxHash) return;

      try {
        setTxState(prev => ({ ...prev, isWaitingTx: true }));
        
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: createdTxHash,
          confirmations: 1,
          timeout: 60_000,
          onReplaced: (replacement) => {
            console.log('Transaction replaced:', replacement);
            if (replacement.reason === 'cancelled') {
              toast({
                variant: "destructive",
                title: "Ser Got Rugged! 💀",
                description: "Paper hands detected, transaction cancelled.",
              });
            }
          }
        });

        if (receipt.status === 'success') {
          toast({
            title: "WAGMI! Based Gladiator Pilled! 🎉",
            description: "Your sigma chad has been forged! Time to stack some GONAD!",
          });

          // Clear form and update states
          setName('');
          setBattleCry('');
          setIsCreating(false);

          // Get new gladiator data
          console.log('Getting new gladiator data...');
          const newGladiatorData = await fetchGladiatorData();
          console.log('New gladiator data:', newGladiatorData);

          if (newGladiatorData && isMounted) {
            console.log('Setting gladiator data');
            setGladiatorData(newGladiatorData);
            setIsGladiator(true);
            
            // Call the callback instead of showing modal
            onGladiatorCreated({
              name: newGladiatorData.name,
              strength: newGladiatorData.strength,
              agility: newGladiatorData.agility,
              vitality: newGladiatorData.vitality,
              intelligence: newGladiatorData.intelligence,
              defense: newGladiatorData.defense,
              battleCry: newGladiatorData.battleCry
            });
          }
        } else {
          toast({
            variant: "destructive",
            title: "NGMI Alert! 💀",
            description: "Ser you got rekt! Touch grass and try again!",
          });
        }
      } catch (error) {
        console.error('Transaction error:', error);
        toast({
          variant: "destructive",
          title: "Down Bad! 💀",
          description: error instanceof Error ? error.message : "Anon got rugged during mint!",
        });
      } finally {
        setTxState(prev => ({ ...prev, isWaitingTx: false }));
        setCreatedTxHash(undefined);
      }
    };

    checkTransaction();

    return () => {
      isMounted = false;
    };
  }, [createdTxHash]);

  useEffect(() => {
    let isMounted = true;

    const checkApproveTransaction = async () => {
      if (!approveTxHash) return;
      
      setTxState(prev => ({ ...prev, isWaitingApprove: true }));
      
      try {
        const success = await checkTransactionStatus(approveTxHash);
        if (!isMounted) return;
        
        setTxState(prev => ({ ...prev, isWaitingApprove: false }));
        
        if (success) {
          toast({
            title: "Based Approval! ✨",
            description: "Gigabrain move! Now preparing to send your gladiator to Valhalla...",
          });
          await handleKillAfterApprove();
        }
      } catch (error) {
        console.error('Error checking approve transaction:', error);
        if (!isMounted) return;
        setTxState(prev => ({ ...prev, isWaitingApprove: false }));
      }
    };

    checkApproveTransaction();

    return () => {
      isMounted = false;
    };
  }, [approveTxHash]);

  useEffect(() => {
    let isMounted = true;

    const checkKillTransaction = async () => {
      if (!killTxHash) return;
      
      setTxState(prev => ({ ...prev, isWaitingKill: true }));
      
      try {
        const success = await checkTransactionStatus(killTxHash);
        if (!isMounted) return;
        
        setTxState(prev => ({ ...prev, isWaitingKill: false }));
        
        if (success) {
          // İşlem durumlarını sıfırla
          setIsCreating(false);
          setShowCreatedModal(false);
          // Başarı mesajını göster
          toast({
            title: "WAGMI! Gladiator Ascended! 🔥",
            description: "Your chad died like a true degen! Time to forge another sigma!",
          });
          // İşlem durumlarını sıfırla
          setIsCreating(false);
          // Verileri yenile
          await loadData();
        }
      } catch (error) {
        console.error('Error checking kill transaction:', error);
        if (!isMounted) return;
        setTxState(prev => ({ ...prev, isWaitingKill: false }));
        setIsCreating(false);
      } finally {
        setKillTxHash(undefined);
      }
    };

    checkKillTransaction();

    return () => {
      isMounted = false;
    };
  }, [killTxHash]);

  // Gladyatör oluşturma
  const handleCreate = async () => {
    if (!walletClient || !address || !name || !battleCry) {
      toast({
        variant: "destructive",
        title: "Down Catastrophic! 💀",
        description: "Fill all fields ser! Stop being ngmi!",
      });
      return;
    }

    try {
      setIsCreating(true);
      setTxState(prev => ({ ...prev, isWaitingTx: true }));

      const simulateResult = await simulateCreateGladiator();
      if (!simulateResult) {
        toast({
          variant: "destructive",
          title: "Simulation Rugged! 💀",
          description: "Your gladiator creation got rekt in simulation! Touch grass and retry!",
        });
        return;
      }

      toast({
        title: "Hopium Time! ⚔️",
        description: "Sign the tx ser! Let's get this chad forged!",
      });

      const hash = await walletClient.writeContract(simulateResult.request);
      setCreatedTxHash(hash);
      
      toast({
        title: "TX In The Pool! ⏳",
        description: "Forging your sigma chad, stay based...",
      });

    } catch (error) {
      console.error('Create gladiator error:', error);
      toast({
        variant: "destructive",
        title: "Maximum Pain! 💀",
        description: error instanceof Error ? error.message : "Ser you're looking kinda ngmi rn!",
      });
      setTxState(prev => ({ ...prev, isWaitingTx: false }));
      setIsCreating(false);
    }
  };

  // İmaj kaydetme
  const handleSaveImage = async () => {
    if (imageUrl && address) {
      await setGladiatorImage(address, imageUrl);
      setIsEditingImage(false);
    }
  };

  // Kill işlemi
  const handleKill = async () => {
    if (!walletClient || !address) {
      toast({
        variant: "destructive",
        title: "Anon Detected! 💀",
        description: "Connect wallet first ser! Don't be ngmi!",
      });
      return;
    }

    try {
      // Check GONAD balance
      const balance = await checkGonadBalance() as bigint;
      if (balance < BigInt(5 * 10**18)) {
        toast({
          variant: "destructive",
          title: "Poor Alert! 💀",
          description: "Ser needs 5 $GONAD to execute! Stop being poor!",
        });
        return;
      }

      // Check allowance
      const currentAllowance = await checkAllowance() as bigint;
      if (currentAllowance < BigInt(5 * 10**18)) {
        // Approve process
        const { request } = await simulateContract(publicClient, {
          ...contracts.gonadToken,
          functionName: 'approve',
          args: [contracts.gladiatorArena.address, BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935')],
          account: address,
        });

        toast({
          title: "Sign For Glory! 🚀",
          description: "Approve the tx ser! Your gladiator's final moments await!",
        });

        const hash = await walletClient.writeContract(request);
        setApproveTxHash(hash);

        toast({
          title: "Based Move Initiated! ⏳",
          description: "Approval tx in the pool, stay diamond hands...",
        });
      } else {
        await handleKillAfterApprove();
      }
    } catch (error) {
      console.error('Kill process failed:', error);
      toast({
        variant: "destructive",
        title: "Maximum Cope! 💀",
        description: error instanceof Error ? error.message : "Your gladiator is too based to die!",
      });
    }
  };

  // Loading durumunda gösterilecek içerik
  if (isLoading) {
    return (
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-[#826ef8] animate-spin mb-2" />
          <p className="text-white/60">Scanning the blockchain for your chad...</p>
        </CardContent>
      </Card>
    );
  }

  // Gladyatör varsa ve veriler yüklendiyse
  if (isGladiator && gladiatorData) {
    return (
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="p-3 pb-2">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="relative">
              <Crown className="w-6 h-6 text-[#826ef8]" />
              <div className="absolute inset-0 bg-[#826ef8]/20 rounded-full filter blur-[8px] animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
                Your Gladiator
              </CardTitle>
              <CardDescription>
                Level {gladiatorData.level} Sigma Chad
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#826ef8]/10 to-transparent rounded-xl" />
            <div className="relative">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div 
                  className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#826ef8]/20 group cursor-pointer hover:border-[#826ef8] transition-colors"
                  onClick={() => setIsEditingImage(true)}
                >
                  <img
                    src={getGladiatorImage(address!)}
                    alt={gladiatorData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImagePlus className="w-5 h-5 text-white" />
                  </div>
                </div>
                {isEditingImage && (
                  <div className="flex flex-col items-center gap-2 w-full max-w-xs animate-in fade-in slide-in-from-top-4">
                    <input
                      type="text"
                      placeholder="Enter image URL"
                      className="w-full bg-black/20 border border-[#826ef8]/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#826ef8]"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingImage(false)}
                        className="bg-black/20 border-[#826ef8]/20 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveImage}
                        disabled={!imageUrl}
                        className="bg-[#826ef8] hover:bg-[#826ef8]/90 text-white"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <GladiatorCard
                name={gladiatorData.name}
                level={Number(gladiatorData.level)}
                experience={Number(gladiatorData.experience)}
                wins={Number(gladiatorData.wins)}
                losses={Number(gladiatorData.losses)}
                winStreak={Number(gladiatorData.winStreak)}
                battleCry={gladiatorData.battleCry}
                stats={{
                  strength: Number(gladiatorData.strength),
                  agility: Number(gladiatorData.agility),
                  vitality: Number(gladiatorData.vitality),
                  intelligence: Number(gladiatorData.intelligence),
                  defense: Number(gladiatorData.defense),
                }}
                showStats={false}
                showKillButton={true}
                showLevel={false}
                onKill={handleKill}
                isKillDisabled={txState.isWaitingTx || txState.isWaitingApprove || txState.isWaitingKill}
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-[#826ef8]/20 rounded-xl bg-black/20">
            <Trophy className="w-8 h-8 text-[#826ef8] drop-shadow-[0_0_2px_#826ef8] mb-2" />
            <p className="text-lg font-medium text-white [text-shadow:_0_0_1px_#826ef8] text-center mb-1">
              Total Earnings
            </p>
            <p className="text-2xl font-bold text-white mb-2">
              {Number(earnings || BigInt(0)) / 1e18} GONAD
            </p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span>{gladiatorData.wins} Wins</span>
              <span>•</span>
              <span>{gladiatorData.winStreak}🔥 Streak</span>
              <span>•</span>
              <span>
                {gladiatorData.wins + gladiatorData.losses > 0
                  ? ((gladiatorData.wins / (gladiatorData.wins + gladiatorData.losses)) * 100).toFixed(1)
                  : '0.0'}% Win Rate
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <CardHeader className="p-3 pb-2">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative">
            <Sword className="w-6 h-6 text-[#826ef8]" />
            <div className="absolute inset-0 bg-[#826ef8]/20 rounded-full filter blur-[8px] animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
              Forge Gigachad 🔥
            </CardTitle>
            <CardDescription>
              Create your sigma gladiator to fight in the arena and stack that GONAD! 💪
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">Gladiator Name</label>
            <Input
              placeholder="Enter a sigma name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/20 border-[#826ef8]/20 text-white"
              maxLength={32}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">Battle Cry</label>
            <Input
              placeholder="Your chad battle cry..."
              value={battleCry}
              onChange={(e) => setBattleCry(e.target.value)}
              className="bg-black/20 border-[#826ef8]/20 text-white"
              maxLength={100}
            />
          </div>
        </div>

        <Button
          className={cn(
            "w-full bg-[#826ef8] hover:bg-[#826ef8]/90 text-white",
            isCreating && "opacity-50 cursor-not-allowed"
          )}
          disabled={!name || !battleCry || isCreating}
          onClick={handleCreate}
        >
          {isCreating || txState.isWaitingTx ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Forging Sigma Chad...
            </>
          ) : (
            "Forge Gigachad 🔥"
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-white/60">
            Mint Fee:  Free!
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 