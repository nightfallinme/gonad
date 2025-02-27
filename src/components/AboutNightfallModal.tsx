'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Code, 
  Rocket, 
  Globe, 
  Twitter, 
  Github, 
  Music,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export function AboutNightfallModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (isOpen && audioElement) {
      const playPromise = audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('Autoplay was prevented:', error);
            setIsPlaying(false);
          });
      }
    } else if (!isOpen && audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isOpen]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/music/nightfall_theme.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-black to-[#1A0B2E] border-[#826ef8]/20">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="flex items-center gap-2 text-white">
                <Avatar className="w-24 h-24 border-4 border-[#826ef8]">
                  <AvatarImage src="/images/nfall.jpg" alt="Nightfall" className="object-cover" />
                  <AvatarFallback>NF</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-2xl font-bold">Nightfall</div>
                  <div className="text-sm text-[#826ef8]">Full Stack Blockchain Developer</div>
                  <div className="text-xs text-white/70 mt-1">🏷️ for tips - thenightfall.eth</div>
                </div>
              </DialogTitle>
              <Button
                variant="ghost"
                className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription asChild className="text-neutral-300 mt-4 space-y-4">
              <div className="space-y-4">
                <div className="text-sm">
                  Hey there! I&apos;m Nightfall, a passionate forever amateur always learning developer 
                  who loves creating innovative and fun decentralized applications.
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-[#826ef8]/20 italic text-white/80 space-y-2">
                  <div>
                    Ah, my crypto journey... Buckle up for a tale of FOMO, hopium, 
                    and more liquidations than a car wash! 🌊💸
                  </div>
                  <div>
                    Started with dreams of lambos, ended up with a portfolio 
                    that looks like a seismograph during an earthquake. 📉🎢 
                    Bought high, sold low - a true Web3 veteran&apos;s rite of passage!
                  </div>
                  <div>
                    But here&apos;s the kicker: despite being perpetually rekt, 
                    my passion for blockchain gaming never wavered. GONAD Arena 
                    is proof that sometimes, your biggest losses fuel your greatest creations. 
                    Still dreaming, still building - just with less leverage and more coffee! ☕️🚀
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white">
                    <Code className="w-5 h-5 text-[#826ef8]" />
                    <span>Specialties: Solidity, TypeScript, React, Web3</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Rocket className="w-5 h-5 text-[#826ef8]" />
                    <span>Creator of GONAD Arena - (just a fun project)</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Globe className="w-5 h-5 text-[#826ef8]" />
                    <span>Building the future of decentralized entertainment</span>
                  </div>
                </div>

                <div className="text-sm text-white/60">
                  Don&apos;t forget to turn on your speakers!
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              size="icon" 
              className="text-[#826ef8] hover:bg-[#826ef8]/10"
              onClick={() => window.open('https://x.com/nightfallinme', '_blank')}
            >
              <Twitter className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="text-[#826ef8] hover:bg-[#826ef8]/10"
              onClick={() => window.open('https://github.com/nightfallinme', '_blank')}
            >
              <Github className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="text-[#826ef8] hover:bg-[#826ef8]/10"
              onClick={() => window.open('https://discord.com/users/thenightfall', '_blank')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-7.008-1.728-7.008-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.144-1.728 7.008 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-1.008-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.096.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.984.792.984zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z"/>
              </svg>
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={`text-[#826ef8] hover:bg-[#826ef8]/10 ${isPlaying ? 'bg-[#826ef8]/20' : ''}`}
              onClick={toggleMusic}
            >
              <Music className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 