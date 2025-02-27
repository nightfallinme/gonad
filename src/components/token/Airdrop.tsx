'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { type Hash } from 'viem';
import { contracts } from '@/config/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TransactionModal } from '@/components/shared/TransactionModal';
import { useToast } from "@/components/ui/use-toast";
import { publicClient } from '@/lib/viem';
import { simulateContract, waitForTransactionReceipt } from 'viem/actions';

export function Airdrop() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [showModal, setShowModal] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<Hash>();
  const [isLoading, setIsLoading] = useState(true);
  const [airdropInfo, setAirdropInfo] = useState<[boolean, bigint, bigint, boolean] | null>(null);
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

  // Airdrop bilgilerini getir
  const fetchAirdropInfo = async () => {
    if (!address) return null;
    try {
      // Önce claim durumunu kontrol et
      const hasClaimed = await publicClient.readContract({
        ...contracts.gonadDistributor,
        functionName: 'hasClaimedAirdrop',
        args: [address],
      }) as boolean;

      // Sonra genel airdrop bilgilerini al
      const data = await publicClient.readContract({
        ...contracts.gonadDistributor,
        functionName: 'getAirdropInfo',
      }) as [boolean, bigint, bigint, boolean];

      // hasClaimed değerini data[3]'e set et
      return [data[0], data[1], data[2], hasClaimed] as [boolean, bigint, bigint, boolean];
    } catch (error) {
      console.error('Error fetching airdrop info:', error);
      return null;
    }
  };

  // Verileri yükle
  const loadData = async () => {
    setIsLoading(true);
    try {
      const info = await fetchAirdropInfo();
      if (info) setAirdropInfo(info);
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
      setAirdropInfo(null);
      setIsLoading(false);
    }
  }, [address]);

  const handleAirdropClaim = async () => {
    if (!walletClient || !address) {
      toast({
        variant: "destructive",
        title: "Anon Detected! 💀",
        description: "Connect wallet first ser! Don't be ngmi!",
      });
      return;
    }

    if (!airdropInfo || !airdropInfo[0]) {
      toast({
        variant: "destructive",
        title: "Not So Fast Ser! 💀",
        description: "Airdrop is not active or still loading!",
      });
      return;
    }

    if (airdropInfo[3]) {
      toast({
        variant: "destructive",
        title: "Already Claimed Ser! 💀",
        description: "Come back tomorrow for more GONAD!",
      });
      return;
    }

    try {
      // Airdrop işlemini simüle et
      const { request } = await simulateContract(publicClient, {
        ...contracts.gonadDistributor,
        functionName: 'claimAirdrop',
        account: address,
      });

      // Simülasyon başarılı, işleme devam et
      toast({
        title: "Sign For Glory! 🚀",
        description: "Sign the tx ser! Your free GONAD awaits!",
      });

      const hash = await walletClient.writeContract(request);
      setCurrentTxHash(hash);
      setShowModal(true);

      toast({
        title: "Based Move Initiated! ⏳",
        description: "Airdrop tx in the pool, stay diamond hands...",
      });

      const success = await checkTransactionStatus(hash);
      
      if (success) {
        toast({
          title: "WAGMI! Airdrop Secured! 🎉",
          description: "Your free GONAD has been claimed! Time to stack more!",
        });
        
        // Airdrop bilgisini yenile
        await loadData();
      }
    } catch (error) {
      console.error('Airdrop claim failed:', error);
      
      // Hata mesajını kontrol et
      let errorMessage = "Ser you're looking kinda ngmi rn!";
      if (error instanceof Error) {
        if (error.message.includes("Already claimed")) {
          errorMessage = "You've already claimed today ser! Come back tomorrow! 🌅";
          // Airdrop bilgisini yenile
          await loadData();
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Maximum Cope! 💀",
        description: errorMessage,
      });
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

  if (!airdropInfo) return null;

  const [, totalAirdropClaimed, airdropRemaining, hasClaimedAirdrop] = airdropInfo;
  const airdropProgress = (Number(totalAirdropClaimed) / Number(totalAirdropClaimed + airdropRemaining)) * 100;

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardContent className="p-6 space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{airdropProgress.toFixed(2)}%</span>
          </div>
          <Progress value={airdropProgress} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Claimed</span>
            <span>{formatNumber(totalAirdropClaimed)} GONAD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Remaining</span>
            <span>{formatNumber(airdropRemaining)} GONAD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Status</span>
            <span>{hasClaimedAirdrop ? 'Claimed' : 'Not Claimed'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Limit</span>
            <span>1 claim per day</span>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-[#7829F9] to-[#FF3D86] hover:opacity-90 transition-opacity disabled:opacity-50"
          onClick={handleAirdropClaim}
          disabled={isLoading || !address || !airdropInfo || !airdropInfo[0] || airdropInfo[3]}
        >
          {!address 
            ? 'Connect Wallet First'
            : isLoading
            ? 'Loading...'
            : !airdropInfo || !airdropInfo[0]
            ? 'Airdrop Not Active'
            : airdropInfo[3]
            ? 'Come Back Tomorrow Ser! 🌅'
            : 'Claim Airdrop'}
        </Button>

        <TransactionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          hash={currentTxHash}
          title="Airdrop Claim"
          description="Processing your airdrop claim..."
        />
      </CardContent>
    </Card>
  );
} 