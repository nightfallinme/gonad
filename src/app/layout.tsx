import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/web3";
import { Toaster } from 'sonner';
import { GladiatorProvider } from '@/contexts/GladiatorContext';
import { SocialFeedProvider } from '@/contexts/SocialFeedContext';
import { TokenProvider } from '@/contexts/TokenContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GONAD Arena",
  description: "Epic blockchain arena battles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TokenProvider>
          <SocialFeedProvider>
            <GladiatorProvider>
              <Web3Provider>
                {children}
              </Web3Provider>
            </GladiatorProvider>
          </SocialFeedProvider>
        </TokenProvider>
        <Toaster 
          position="bottom-right"
          closeButton
          richColors
          expand
          theme="dark"
        />
      </body>
    </html>
  );
}
