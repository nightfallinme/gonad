'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function ConnectWallet() {
  return (
    <ConnectButton
      label="Connect Wallet"
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full'
      }}
      chainStatus={{
        smallScreen: 'icon',
        largeScreen: 'full'
      }}
      showBalance={{
        smallScreen: false,
        largeScreen: true
      }}
    />
  );
} 