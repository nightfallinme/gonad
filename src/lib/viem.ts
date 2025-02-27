import { createPublicClient, http } from 'viem';
import { monadTestnet } from '@/config/chains';

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http()
}); 