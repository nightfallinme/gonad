import { type Chain } from 'viem';

export const monadTestnet = {
  id: 10_143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    public: { 
      http: [
        'https://testnet-rpc.monad.xyz',
        'https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6'
      ] 
    },
    default: { 
      http: [
        'https://testnet-rpc.monad.xyz',
        'https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6'
      ] 
    },
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com' },
  },
  contracts: {},
  testnet: true,
} as const satisfies Chain; 