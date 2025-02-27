'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { type Hash } from 'viem';
import { contracts } from '@/config/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TransactionModal } from '@/components/shared/TransactionModal';
import { useToast } from "@/components/ui/use-toast";
import { publicClient } from '@/lib/viem';
import { waitForTransactionReceipt } from 'viem/actions';

export function Presale() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<Hash>();
  const [isLoading, setIsLoading] = useState(true);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [presaleInfo, setPresaleInfo] = useState<[boolean, bigint, bigint, bigint, bigint] | null>(null);
  const { toast } = useToast();

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

  // Presale bilgilerini getir
  const fetchPresaleInfo = async () => {
    if (!address) return null;
    try {
      // Önce kullanıcının claim durumunu kontrol et
      const userClaims = await publicClient.readContract({
        ...contracts.gonadDistributor,
        functionName: 'presaleClaims',
        args: [address],
      }) as bigint;

      // Sonra genel presale bilgilerini al
      const data = await publicClient.readContract({
        ...contracts.gonadDistributor,
        functionName: 'getPresaleInfo',
      }) as [boolean, bigint, bigint, bigint, bigint];

      // userClaims değerini data[3]'e set et
      return [data[0], data[1], data[2], userClaims, data[4]] as [boolean, bigint, bigint, bigint, bigint];
    } catch (error) {
      console.error('Error fetching presale info:', error);
      return null;
    }
  };

  // Verileri yükle
  const loadData = async () => {
    setIsLoading(true);
    try {
      const info = await fetchPresaleInfo();
      if (info) setPresaleInfo(info);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // İlk yükleme ve adres değiştiğinde verileri yenile
  useEffect(() => {
    if (address) {
      loadData();
    } else {
      setPresaleInfo(null);
      setIsLoading(false);
    }
  }, [address]);

  const handlePresaleClaim = async () => {
    if (!walletClient || !address || !amount) {
      toast({
        variant: "destructive",
        title: "ngmi anon 💀",
        description: "wen connect wallet + amount ser?",
      });
      return;
    }

    if (!presaleInfo || !presaleInfo[0]) {
      toast({
        variant: "destructive",
        title: "ser pls 💀",
        description: "presale not live yet, stay tuned fren",
      });
      return;
    }

    // Miktar kontrolü
    const monAmount = BigInt(Math.floor(Number(amount) * 1e18)); // MON miktarı
    const gonadAmount = monAmount * BigInt(10); // Her 1 MON için 10 GONAD
    
    const maxGonadAllowed = BigInt(100) * BigInt(1e18); // 100 GONAD
    const minGonadAllowed = BigInt(1) * BigInt(1e18);   // 1 GONAD

    if (gonadAmount > maxGonadAllowed) {
      toast({
        variant: "destructive",
        title: "too much ser 💀",
        description: "max 100 $GONAD per tx anon",
      });
      return;
    }

    if (gonadAmount < minGonadAllowed) {
      toast({
        variant: "destructive",
        title: "too smol ser 💀",
        description: "min 1 $GONAD required fren",
      });
      return;
    }

    // Kullanıcının limit kontrolü
    const userClaimed = presaleInfo[3];
    const maxPerUser = BigInt(1000) * BigInt(1e18); // 1000 GONAD
    if (userClaimed + gonadAmount > maxPerUser) {
      toast({
        variant: "destructive",
        title: "ser pls 💀",
        description: "max 1000 $GONAD per wallet, don't be greedy anon",
      });
      return;
    }

    setIsTxLoading(true);
    try {
      // İşleme başla
      toast({
        title: "gm fren! 🚀",
        description: "sign tx ser, $GONAD awaits",
      });

      let hash;
      try {
        // Direkt olarak işlemi gönder
        hash = await walletClient.writeContract({
          ...contracts.gonadDistributor,
          functionName: 'claimPresale',
          args: [gonadAmount],
          value: monAmount, // MON miktarını gönder
        });
      } catch (error: unknown) {
        if (error instanceof Error && error.message?.includes('User rejected the request')) {
          toast({
            variant: "destructive",
            title: "paper hands detected 🧻",
            description: "ngmi ser... even $PEPE holders are braver than u",
          });
        }
        setIsTxLoading(false);
        return;
      }

      if (hash) {
        setCurrentTxHash(hash);
        setShowModal(true);

        toast({
          title: "based move anon ⏳",
          description: "tx in mempool, hodl tight...",
        });

        const success = await checkTransactionStatus(hash);
        
        if (success) {
          toast({
            title: "wagmi fren! 🎉",
            description: "enjoy ur $GONAD ser, wen moon?",
          });
          
          // Presale bilgisini yenile
          await loadData();
          // Input'u temizle
          setAmount('');
        }
      }
    } catch (error) {
      console.error('Presale claim failed:', error);
      
      // Hata mesajını kontrol et
      let errorMessage = "ngmi rn ser!";
      if (error instanceof Error) {
        if (error.message.includes("Exceeds user limit")) {
          errorMessage = "max 1000 $GONAD per wallet ser, don't be greedy";
        } else if (error.message.includes("Insufficient balance")) {
          errorMessage = "not enough $MON ser, touch grass and stack more";
        } else if (error.message.includes("Below minimum amount")) {
          errorMessage = "min 1 $GONAD required ser, don't be poor";
        } else if (error.message.includes("Exceeds maximum amount")) {
          errorMessage = "max 100 $GONAD per tx ser, slow down whale";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "ngmi ser 💀",
        description: errorMessage,
      });
    } finally {
      setIsTxLoading(false);
    }
  };

  const formatNumber = (value: bigint) => {
    return (Number(value) / 1e18).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#826ef8]" />
        </CardContent>
      </Card>
    );
  }

  if (!presaleInfo) return null;

  const [, totalPresaleClaimed, presaleRemaining, userPresaleClaimed, userPresaleRemaining] = presaleInfo;
  const presaleProgress = (Number(totalPresaleClaimed) / Number(totalPresaleClaimed + presaleRemaining)) * 100;

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardContent className="p-6 space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{presaleProgress.toFixed(2)}%</span>
          </div>
          <Progress value={presaleProgress} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Claimed</span>
            <span>{formatNumber(totalPresaleClaimed)} GONAD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Remaining</span>
            <span>{formatNumber(presaleRemaining)} GONAD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Your Claims</span>
            <span>{formatNumber(userPresaleClaimed)} GONAD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Your Remaining</span>
            <span>{formatNumber(userPresaleRemaining)} GONAD</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-[#826ef8]">
            <span>Rate</span>
            <span>1 MON = 10 GONAD</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-[#826ef8]">
            <span>You Get</span>
            <span>{amount ? (Number(amount) * 10).toFixed(2) : '0.00'} GONAD</span>
          </div>
        </div>

        <div className="relative space-y-4">
          <div className="relative">
            <Input
              type="number"
              placeholder="Amount in MON (0.1-10)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.1"
              max="10"
              step="0.1"
              className="bg-[#1a1a1a] border-[#826ef8] text-[#826ef8] font-medium placeholder:text-gray-400 focus:border-[#FF3D86] focus:ring-[#FF3D86] transition-colors text-right pr-16"
            />
            <span className="absolute right-3 top-[50%] -translate-y-[50%] text-[#826ef8] font-medium">
              MON
            </span>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-[#FF3D86] to-[#7829F9] hover:opacity-90 transition-all duration-300 disabled:opacity-50 relative h-12"
            onClick={handlePresaleClaim}
            disabled={isLoading || isTxLoading || !address || !presaleInfo || !presaleInfo[0] || !amount || Number(amount) <= 0 || Number(amount) > 10}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="relative z-10 transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                {!address 
                  ? 'Connect Wallet First'
                  : isLoading || isTxLoading
                  ? 'Loading...'
                  : !presaleInfo || !presaleInfo[0]
                  ? 'Presale Not Active'
                  : !amount || Number(amount) <= 0
                  ? 'Enter Amount'
                  : Number(amount) > 10
                  ? 'Max 10 MON'
                  : `${amount ? (Number(amount) * 10).toFixed(2) : '0.00'} GONAD`}
              </span>
              <span className="absolute z-20 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                Buy GONAD
              </span>
            </div>
          </Button>
        </div>

        <TransactionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          hash={currentTxHash}
          title="wen $GONAD"
          description="cooking ur transaction ser..."
        />
      </CardContent>
    </Card>
  );
} 