'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { publicClient } from '@/lib/viem';
import { contracts } from '@/config/contracts';
import { SocialEvent, SocialEventType } from '@/types/SocialEvent';
import { useToast } from "@/components/ui/use-toast";
import { decodeEventLog, Log } from 'viem';
import socialEventsData from '@/data/socialEvents.json';

interface SocialFeedContextType {
  events: SocialEvent[];
  addEvent: (event: SocialEvent) => void;
}

const SocialFeedContext = createContext<SocialFeedContextType>({
  events: [],
  addEvent: () => {},
});

interface RawSocialEvent {
  type: string;
  sender: string;
  content: string;
  timestamp: number;
  id: string;
}

const extractEventData = (log: Log, eventName: string) => {
  try {
    const decodedLog = decodeEventLog({
      abi: contracts.gonadToken.abi,
      data: log.data,
      topics: log.topics,
    });

    if (!decodedLog.args || !Array.isArray(decodedLog.args)) {
      console.error(`Invalid args for ${eventName} event`);
      return null;
    }

    return decodedLog.args;
  } catch (error) {
    console.error(`Failed to decode ${eventName} event:`, error);
    return null;
  }
};

// JSON verilerini SocialEvent türüne dönüştür
const convertToSocialEvents = (events: RawSocialEvent[]): SocialEvent[] => {
  return events
    .filter(event => event.sender.startsWith('0x')) // Sadece geçerli Ethereum adreslerini al
    .map(event => ({
      ...event,
      sender: event.sender as `0x${string}`, // Ethereum adresini doğru tipe dönüştür
      type: event.type === 'meme' ? SocialEventType.MEME : 
           SocialEventType.FLEX
    }));
};

export function SocialFeedProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<SocialEvent[]>(
    convertToSocialEvents(socialEventsData.events)
  );
  const { toast } = useToast();

  const addEvent = async (newEvent: SocialEvent) => {
    const updatedEvents = [newEvent, ...events].slice(0, 50);
    setEvents(updatedEvents);
    
    // API'ye kaydet
    try {
      await fetch('/api/social-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent), // JSON dosyasına kaydet
      });
    } catch (error) {
      console.error('Failed to save social event:', error);
    }

    toast({
      title: `New ${newEvent.type.charAt(0).toUpperCase() + newEvent.type.slice(1)} Event! 🚀`,
      description: `${newEvent.sender.slice(0,6)}... just created an event`,
    });
  };

  // İlk yüklemede event'leri fetch et
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/social-events');
        const fetchedEvents = await response.json();
        setEvents(convertToSocialEvents(fetchedEvents));
      } catch (error) {
        console.error('Failed to fetch social events:', error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    // Meme event'lerini dinle
    const unwatch = publicClient.watchContractEvent({
      ...contracts.gonadToken,
      eventName: 'MemePosted',
      onLogs(logs) {
        logs.forEach(log => {
          const args = extractEventData(log, 'MemePosted');
          if (args) {
            const event: SocialEvent = {
              id: log.transactionHash || crypto.randomUUID(),
              type: SocialEventType.MEME,
              sender: args[0] as `0x${string}`,
              content: args[1] as string,
              timestamp: Date.now()
            };
            addEvent(event);
          }
        });
      }
    });

    // Flex event'lerini dinle
    const unwatchFlex = publicClient.watchContractEvent({
      ...contracts.gonadToken,
      eventName: 'GigaChad',
      onLogs(logs) {
        logs.forEach(log => {
          const args = extractEventData(log, 'GigaChad');
          if (args) {
            const event: SocialEvent = {
              id: log.transactionHash || crypto.randomUUID(),
              type: SocialEventType.FLEX,
              sender: args[0] as `0x${string}`,
              content: `Flexed with power ${args[1]}`,
              timestamp: Date.now()
            };
            addEvent(event);
          }
        });
      }
    });

    // Temizleme fonksiyonu
    return () => {
      unwatch();
      unwatchFlex();
    };
  }, []);

  return (
    <SocialFeedContext.Provider value={{ events, addEvent }}>
      {children}
    </SocialFeedContext.Provider>
  );
}

export const useSocialFeed = () => useContext(SocialFeedContext); 