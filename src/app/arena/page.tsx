'use client';

import { GladiatorProvider, useGladiators } from '@/contexts/GladiatorContext';
import { BattleArena } from '@/components/arena/BattleArena';
import { LeaderBoard } from '@/components/arena/LeaderBoard';
import { BattleLog } from '@/components/arena/BattleLog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Trophy, ChevronDown } from "lucide-react";
import { useState, useEffect } from 'react';
import { GladiatorCreatedModal } from '@/components/arena/GladiatorCreatedModal';
import { ForgeGladiator } from '@/components/arena/ForgeGladiator';

interface GladiatorModalData {
  name: string;
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  defense: number;
  battleCry: string;
}

function ArenaPage() {
  const { address, refreshGladiators } = useGladiators();
  const [showGladiatorModal, setShowGladiatorModal] = useState(false);
  const [gladiatorModalData, setGladiatorModalData] = useState<GladiatorModalData | undefined>();

  useEffect(() => {
    // İlk yüklemede gladiatörleri yenile
    if (address) {
      refreshGladiators(address);
    }
  }, []); // Boş bağımlılık dizisi ile sadece ilk yüklemede çalışır

  return (
    <main className="container mx-auto p-0 space-y-8">
      <div className="relative">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text px-4 mb-2">
          GONAD Arena
        </h1>

        <Collapsible>
          <CollapsibleTrigger className="absolute left-1/2 -translate-x-1/2 -bottom-2 flex items-center justify-center gap-1 py-1 px-3 rounded-b-xl bg-black/40 border-x border-b border-[#826ef8]/20 hover:bg-[#826ef8]/5 transition-colors group">
            <Trophy className="w-3 h-3 text-[#826ef8] group-hover:scale-110 transition-transform" />
            <ChevronDown className="w-3 h-3 text-[#826ef8] transition-transform data-[state=open]:rotate-180 group-hover:translate-y-0.5 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-6">
              <LeaderBoard />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="grid lg:grid-cols-[1fr,400px] gap-0">
        <div className="space-y-8">
          <BattleArena />
          <div className="bg-black/20 backdrop-blur border border-[#826ef8]/20 rounded-xl">
            <ForgeGladiator 
              onGladiatorCreated={(gladiator) => {
                setGladiatorModalData(gladiator);
                setShowGladiatorModal(true);
              }}
            />
          </div>
        </div>
        <div>
          <BattleLog />
        </div>
      </div>

      <GladiatorCreatedModal
        isOpen={showGladiatorModal}
        onClose={() => setShowGladiatorModal(false)}
        gladiator={gladiatorModalData}
      />
    </main>
  );
}

export default function Page() {
  return (
    <GladiatorProvider>
      <ArenaPage />
    </GladiatorProvider>
  );
} 