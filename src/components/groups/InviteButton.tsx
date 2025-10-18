import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Mail, MessageSquare, Copy, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteButtonProps {
  groupName: string;
  inviteCode: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const InviteButton = ({ groupName, inviteCode, variant = "default", size = "default" }: InviteButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const inviteMessage = `🏋️ Join my fitness challenge "${groupName}"! 

Use invite code: ${inviteCode}

Let's get fit together! 💪

Join here: ${window.location.origin}/?invite=${inviteCode}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      setIsSharing(true);
      try {
        await navigator.share({
          title: `Join "${groupName}" Fitness Challenge`,
          text: inviteMessage,
        });
        toast({
          title: "Shared successfully!",
          description: "Your group invite has been shared.",
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback to copy to clipboard
      handleCopyInvite();
    }
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      toast({
        title: "Invite copied!",
        description: "The invite message has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the invite code manually.",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Join my fitness challenge "${groupName}"`);
    const body = encodeURIComponent(inviteMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSMSShare = () => {
    const body = encodeURIComponent(inviteMessage);
    window.open(`sms:?body=${body}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(inviteMessage);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Check if native sharing is available
  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share;

  if (hasNativeShare) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        disabled={isSharing}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        {isSharing ? "Sharing..." : "Invite Friends"}
      </Button>
    );
  }

  // Fallback dropdown menu for desktop/browsers without native share
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Invite Friends
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyInvite}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Invite Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailShare}>
          <Mail className="h-4 w-4 mr-2" />
          Share via Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSMSShare}>
          <Smartphone className="h-4 w-4 mr-2" />
          Share via SMS
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppShare}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Share via WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InviteButton;