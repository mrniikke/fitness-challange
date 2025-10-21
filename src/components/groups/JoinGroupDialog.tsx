import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const joinSchema = z.object({
  inviteCode: z.string()
    .trim()
    .length(8, "Invite code must be 8 characters")
    .regex(/^[A-Z0-9]+$/i, "Invalid invite code format")
    .transform(val => val.toUpperCase()),
});

interface JoinGroupDialogProps {
  onGroupJoined?: () => void;
}

const JoinGroupDialog = ({ onGroupJoined }: JoinGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const validated = joinSchema.parse({ inviteCode });

      // Use secure RPC function to find group by invite code
      const { data: groupData, error: groupError } = await supabase
        .rpc('get_group_by_invite', {
          invite_code_param: validated.inviteCode
        })
        .maybeSingle();

      if (groupError) throw groupError;
      
      if (!groupData) {
        toast({
          variant: "destructive",
          title: "Invalid invite code",
          description: "The invite code you entered is not valid.",
        });
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember) {
        toast({
          variant: "destructive",
          title: "Already a member",
          description: "You are already a member of this group.",
        });
        return;
      }

      // Join group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'member',
        });

      if (joinError) throw joinError;

      toast({
        title: "Joined group!",
        description: `You have successfully joined "${groupData.name}".`,
      });

      setInviteCode("");
      setOpen(false);
      onGroupJoined?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation error",
          description: error.issues[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error joining group",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-border hover:bg-secondary">
          Join Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter 8-character code"
              className="uppercase"
              maxLength={8}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Joining..." : "Join Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupDialog;
