'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, usePublicClient, useAccount } from 'wagmi';
import { monadTestnet } from '@/config/chains';
import { useEffect } from 'react';
import { toast } from 'sonner';

function Web3Provider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  const config = getDefaultConfig({
    appName: 'GONAD Arena',
    projectId: '57b687c9394aa7599de230b1bf93074e',
    chains: [monadTestnet],
    ssr: false,
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          <NetworkCheck />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function NetworkCheck() {
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  useEffect(() => {
    async function checkNetwork() {
      if (!isConnected || !publicClient) return;

      try {
        const chainId = await publicClient.getChainId();
        
        if (chainId !== monadTestnet.id) {
          toast.error('Wrong Network!', {
            description: 'Please switch to Monad Testnet to use GONAD Arena',
            action: {
              label: 'Switch Network',
              onClick: () => {
                if (window.ethereum) {
                  window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${monadTestnet.id.toString(16)}` }],
                  });
                }
              },
            },
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error checking network:', error);
      }
    }

    checkNetwork();
  }, [isConnected, publicClient]);

  return null;
}

export { Web3Provider }; 