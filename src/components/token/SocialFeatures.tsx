'use client';

import { useState, useEffect } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { contracts } from '@/config/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionModal } from '@/components/shared/TransactionModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/components/ui/use-toast";
import { publicClient } from '@/lib/viem';
import { simulateContract, waitForTransactionReceipt } from 'viem/actions';
import { type Hash } from 'viem';
import { useSocialFeed } from '@/contexts/SocialFeedContext';
import { SocialEventType } from '@/types/SocialEvent';


interface FlexStatus {
  dailyFlexes: number;
  memeCount: number;
}

interface Gladiator {
  name: string;
}

export function SocialFeatures() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [meme, setMeme] = useState('');
  const [showTxModal, setShowTxModal] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<Hash>();
  const [currentAction, setCurrentAction] = useState<'flex' | 'meme'>();
  const [flexStatus, setFlexStatus] = useState<FlexStatus | null>(null);
  const { toast } = useToast();
  const { addEvent } = useSocialFeed();

  const fetchFlexStatus = async () => {
    if (!address) return null;
    
    try {
      // Get flex status
      const status = await publicClient.readContract({
        ...contracts.gonadToken,
        functionName: 'getFlexStatus',
        args: [address],
      });

      // Type check
      if (status && typeof status === 'object' && 'dailyFlexes' in status && 'memeCount' in status) {
        setFlexStatus(status as FlexStatus);
        return status;
      } else {
        console.warn('Invalid flex status format:', status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching flex status:', error);
      toast({
        variant: "destructive",
        title: "Failed to Fetch Flex Status! 💀",
        description: "Check your network connection and try again.",
      });
      return null;
    }
  };

  useEffect(() => {
    if (address) {
      fetchFlexStatus();
    }

    // Update every 10 minutes when page is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && address) {
        fetchFlexStatus();
      }
    }, 600000);

    // Update on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && address) {
        fetchFlexStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [address]);

  const handleFlex = async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Anon Detected! 💀",
        description: "Connect wallet first ser! Don't be ngmi!",
      });
      return;
    }

    if (!walletClient) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet and try again.",
      });
      return;
    }

    try {
      setCurrentAction('flex');
      
      // Simulate transaction
      const { request } = await simulateContract(publicClient, {
        ...contracts.gonadToken,
        functionName: 'flexOnThem',
        account: address,
      });

      toast({
        title: "Sign For Glory! 💪",
        description: "Sign the tx ser! Your flex awaits!",
      });

      // Send transaction
      const hash = await walletClient.writeContract(request);
      setCurrentTxHash(hash);
      setShowTxModal(true);

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(publicClient, { hash });
      
      if (receipt.status === 'success') {
        toast({
          title: "WAGMI Alert! 🚀",
          description: "Your flex is being immortalized on-chain, ser! Diamond hands only! 💎🙌"
        });
        
        await fetchFlexStatus();
        const power = request.args && request.args.length > 1 ? request.args[1] : 'unknown power';
        const gladiatorData = await publicClient.readContract({
          ...contracts.gladiatorArena,
          functionName: 'getGladiator',
          args: [address],
        }) as Gladiator;

        const newEvent = {
          id: currentTxHash || crypto.randomUUID(),
          type: SocialEventType.FLEX,
          sender: address as `0x${string}`,
          content: `${gladiatorData.name} flexed with power ${power}`,
          timestamp: Date.now(),
        };
        addEvent(newEvent);
      }
    } catch (error: unknown) {
      console.error('Failed to flex:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Ser you're looking kinda ngmi rn!";
      
      toast({
        variant: "destructive",
        title: "Down Bad Ser 📉",
        description: errorMessage,
      });
    }
  };

  const handlePostMeme = async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Anon Detected! 💀",
        description: "Connect wallet first ser! Don't be ngmi!",
      });
      return;
    }

    if (!walletClient) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet and try again.",
      });
      return;
    }

    if (!meme || meme.trim() === '') {
      toast({
        variant: "destructive",
        title: "Meme Error",
        description: "Please enter a meme before posting!",
      });
      return;
    }

    try {
      setCurrentAction('meme');
      
      // Simulate transaction
      const { request } = await simulateContract(publicClient, {
        ...contracts.gonadToken,
        functionName: 'postMeme',
        args: [meme],
        account: address,
      });

      toast({
        title: "Sign For Dankness! 🧠",
        description: "Sign the tx ser! Your meme awaits!",
      });

      // Send transaction
      const hash = await walletClient.writeContract(request);
      setCurrentTxHash(hash);
      setShowTxModal(true);
      setMeme('');

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(publicClient, { hash });
      
      if (receipt.status === 'success') {
        toast({
          title: "Based Alert! 🔥",
          description: "Your galaxy brain meme is being etched into the blockchain! IYKYK 🧠"
        });

        // Gladiatör adını almak için cüzdan adresini kullan
        const gladiatorData = await publicClient.readContract({
          ...contracts.gladiatorArena,
          functionName: 'getGladiator',
          args: [address],
        }) as Gladiator;

        const newEvent = {
          id: currentTxHash || crypto.randomUUID(),
          type: SocialEventType.MEME,
          sender: address as `0x${string}`,
          content: `${gladiatorData.name} posted a meme: ${meme}`,
          timestamp: Date.now(),
        };
        addEvent(newEvent);
      }
    } catch (error: unknown) {
      console.error('Failed to post meme:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Ser, this ain't it... touch some grass and try again!";
      
      toast({
        variant: "destructive",
        title: "Copium Overdose 😵",
        description: errorMessage
      });
    }
  };

  const getModalTitle = () => {
    switch (currentAction) {
      case 'flex':
        return 'Flexing GONAD';
      case 'meme':
        return 'Posting Dank Meme';
      default:
        return 'Transaction in Progress';
    }
  };

  const getModalDescription = () => {
    switch (currentAction) {
      case 'flex':
        return 'Your epic GONAD flex is being processed... WAGMI! 💪';
      case 'meme':
        return 'Your galaxy brain meme is being immortalized on-chain... few understand 🧠';
      default:
        return 'Cooking some alpha for you ser... please wait! 👨‍🍳';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-lg">GONAD Social Hub</CardTitle>
        <CardDescription className="text-xs">
          Flex your bags and post dank memes!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <Tabs defaultValue="flex" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flex">Flex</TabsTrigger>
            <TabsTrigger value="meme">Memes</TabsTrigger>
          </TabsList>

          <TabsContent value="flex" className="space-y-2">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Daily Flexes</h3>
              <p className="text-xs text-muted-foreground">
                {flexStatus?.dailyFlexes || 0}/42 flexes today
              </p>
              <Button
                onClick={handleFlex}
                disabled={!address || (flexStatus?.dailyFlexes || 0) >= 42}
                className="w-full text-xs py-1.5"
              >
                LFG! Flex Those GONADs
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="meme" className="space-y-2">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Post Dank Meme</h3>
              <p className="text-xs text-muted-foreground">
                {flexStatus?.memeCount || 0}/69 memes posted
              </p>
              <Input
                placeholder="Drop your dankest meme here ser..."
                value={meme}
                onChange={(e) => setMeme(e.target.value)}
                maxLength={280}
                className="text-xs py-1.5"
              />
              <Button
                onClick={handlePostMeme}
                disabled={!address || !meme || (flexStatus?.memeCount || 0) >= 69}
                className="w-full text-xs py-1.5"
              >
                WAGMI, Post It!
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <TransactionModal
        isOpen={showTxModal}
        onClose={() => setShowTxModal(false)}
        hash={currentTxHash}
        title={getModalTitle()}
        description={getModalDescription()}
      />
    </Card>
  );
} 