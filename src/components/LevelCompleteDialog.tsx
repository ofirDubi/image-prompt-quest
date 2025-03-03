
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Facebook, Instagram, MessageCircle, Link as LinkIcon } from "lucide-react";

interface LevelCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
  guesses: number;
  onNextLevel: () => void;
  onShare: (method: 'facebook' | 'instagram' | 'whatsapp' | 'link') => void;
}

const LevelCompleteDialog: React.FC<LevelCompleteDialogProps> = ({
  open,
  onOpenChange,
  level,
  guesses,
  onNextLevel,
  onShare,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            🎉 Congratulations! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            You have completed Level {level}!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center mb-2">
            You used <span className="font-bold">{guesses}</span> guesses to complete this level.
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Keep going to unlock more levels and improve your skills!
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" /> Share Achievement
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onShare('facebook')}>
                <Facebook className="w-4 h-4 mr-2" /> Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare('instagram')}>
                <Instagram className="w-4 h-4 mr-2" /> Instagram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare('whatsapp')}>
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare('link')}>
                <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={onNextLevel}>
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LevelCompleteDialog;
