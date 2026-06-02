import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SparklesIcon, CheckCircle2Icon } from "lucide-react";
import Link from "next/link";

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeProModal({ isOpen, onClose }: UpgradeProModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-border/60">
        <DialogHeader className="flex flex-col items-center text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <SparklesIcon className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            You've reached the limit of workflows on the Free plan. Upgrade to Pro for unlimited workflows and advanced features.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2Icon className="w-4 h-4 text-primary" />
            <span>Unlimited AI generated workflows</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2Icon className="w-4 h-4 text-primary" />
            <span>Unlimited workflow runs</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2Icon className="w-4 h-4 text-primary" />
            <span>Premium support</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Link href="/#pricing" className="w-full">
            <Button className="w-full text-md font-semibold py-6 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90">
              Upgrade Now
            </Button>
          </Link>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
