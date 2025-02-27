'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSocialFeed } from '@/contexts/SocialFeedContext';
import { SocialEventType } from '@/types/SocialEvent';
import { Smile, Zap } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface SocialBoardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SocialBoard({ isOpen, onClose }: SocialBoardProps) {
  const { events } = useSocialFeed();
  const [activeTab, setActiveTab] = useState<SocialEventType>(SocialEventType.MEME);

  const getEventIcon = (type: SocialEventType) => {
    switch (type) {
      case SocialEventType.MEME:
        return <Smile className="w-4 h-4 text-blue-500" />;
      case SocialEventType.FLEX:
        return <Zap className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getEventColor = (type: SocialEventType) => {
    switch (type) {
      case SocialEventType.MEME:
        return "bg-blue-500/10 text-blue-500";
      case SocialEventType.FLEX:
        return "bg-yellow-500/10 text-yellow-500";
    }
  };

  const filteredEvents = events.filter(event => event.type === activeTab);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-black/95 border border-[#826ef8]/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="relative">
              <div className="absolute inset-0 bg-[#826ef8]/20 rounded-full filter blur-[8px] animate-pulse" />
            </div>
            GONAD Social Board
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center mb-4">
          <div className="inline-flex bg-black/20 rounded-lg p-1 border border-[#826ef8]/20">
            {[SocialEventType.MEME, SocialEventType.FLEX].map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === type 
                    ? 'bg-[#826ef8] text-white' 
                    : 'text-white/60 hover:bg-[#826ef8]/10'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-2 pr-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center text-white/50 py-8">
                No {activeTab} events yet
              </div>
            ) : (
              filteredEvents.map(event => (
                <div 
                  key={event.id} 
                  className="p-3 bg-black/20 border border-[#826ef8]/20 rounded-lg hover:bg-[#826ef8]/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.type)}
                      <Badge 
                        className={`${getEventColor(event.type)} text-xs font-normal`}
                      >
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                    </div>
                    <span className="text-xs text-white/50">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-white/80">
                      {event.sender.slice(0, 6)}...{event.sender.slice(-4)}
                    </span>
                    <div className="flex-1 text-sm break-words text-white/90">
                      {event.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 