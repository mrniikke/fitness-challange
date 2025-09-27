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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const groupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters"),
  description: z.string().optional(),
  dailyGoal: z.number().min(1, "Daily goal must be at least 1 push-up").max(1000, "Daily goal cannot exceed 1000 push-ups"),
});

interface CreateGroupDialogProps {
  onGroupCreated?: () => void;
}

const CreateGroupDialog = ({ onGroupCreated }: CreateGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dailyGoal, setDailyGoal] = useState(200);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const validationData = { 
        name, 
        description: description || undefined,
        dailyGoal 
      };
      groupSchema.parse(validationData);

      console.log('Creating group with user ID:', user.id);

      // Generate invite code (client-side)
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          description: description || null,
          daily_goal: dailyGoal,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) {
        console.error('Group creation error:', groupError);
        throw groupError;
      }

      console.log('Group created:', groupData);

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        throw memberError;
      }

      toast({
        title: "Group created!",
        description: `Your group "${name}" has been created with a daily goal of ${dailyGoal} push-ups. Invite code: ${inviteCode}`,
      });

      setName("");
      setDescription("");
      setDailyGoal(200);
      setOpen(false);
      onGroupCreated?.();
    } catch (error) {
      console.error('Full error:', error);
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation error",
          description: error.issues[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error creating group",
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
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your group's challenge"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dailyGoal">Daily Push-up Goal</Label>
            <Input
              id="dailyGoal"
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value) || 200)}
              placeholder="200"
              min="1"
              max="1000"
              required
            />
            <p className="text-xs text-muted-foreground">
              Set how many push-ups each member should aim for daily (1-1000)
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;