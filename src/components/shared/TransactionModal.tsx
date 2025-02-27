'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWaitForTransactionReceipt } from "wagmi";
import { Loader2 } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  hash?: `0x${string}`;
  title: string;
  description: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  hash,
  title,
  description,
}: TransactionModalProps) {
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4">
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-sm text-muted-foreground">
                Transaction in progress...
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="flex flex-col items-center gap-4">
              <div className="text-green-500 text-xl">✨</div>
              <p className="text-sm text-muted-foreground">
                Transaction successful!
              </p>
            </div>
          )}

          {hash && (
            <a
              href={`https://testnet.monadexplorer.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-sm text-purple-500 hover:text-purple-600"
            >
              View on Explorer
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 