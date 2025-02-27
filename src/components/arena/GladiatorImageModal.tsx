import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGladiatorImages } from '@/hooks/useGladiatorImages';

interface GladiatorImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  gladiatorAddress: string;
  gladiatorName: string;
}

export function GladiatorImageModal({
  isOpen,
  onClose,
  gladiatorAddress,
  gladiatorName
}: GladiatorImageModalProps) {
  const { getGladiatorImage, setGladiatorImage } = useGladiatorImages();
  const [imageUrl, setImageUrl] = useState('');

  const handleSave = () => {
    if (imageUrl) {
      setGladiatorImage(gladiatorAddress, imageUrl);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border-[#826ef8]/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
            Gladyatör İmajını Güncelle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#826ef8]/20">
              <img
                src={getGladiatorImage(gladiatorAddress)}
                alt={gladiatorName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{gladiatorName}</h3>
              <p className="text-sm text-white/60">Yeni bir imaj URL&apos;si girin</p>
            </div>
          </div>

          <Input
            placeholder="İmaj URL&apos;si"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-black/20 border-[#826ef8]/20 text-white"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-black/20 border-[#826ef8]/20 hover:border-[#826ef8] hover:bg-[#826ef8]/20 text-white"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#826ef8] hover:bg-[#826ef8]/90 text-white"
              disabled={!imageUrl}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 