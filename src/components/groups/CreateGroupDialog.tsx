import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

interface Challenge {
  name: string;
  goal_amount: number;
}

interface CreateGroupDialogProps {
  onGroupCreated?: () => void;
}

const CreateGroupDialog = ({ onGroupCreated }: CreateGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [challenges, setChallenges] = useState<Challenge[]>([{ name: "", goal_amount: 0 }]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const addChallenge = () => {
    if (challenges.length < 10) {
      setChallenges([...challenges, { name: "", goal_amount: 0 }]);
    }
  };

  const removeChallenge = (index: number) => {
    if (challenges.length > 1) {
      setChallenges(challenges.filter((_, i) => i !== index));
    }
  };

  const updateChallenge = (index: number, field: keyof Challenge, value: string | number) => {
    const updated = challenges.map((challenge, i) => 
      i === index ? { ...challenge, [field]: value } : challenge
    );
    setChallenges(updated);
  };

  const handleSubmit = async () => {
    if (!user || !name.trim()) return;

    // Validate challenges
    const validChallenges = challenges.filter(c => c.name.trim() && c.goal_amount > 0);
    if (validChallenges.length === 0) {
      toast({
        title: "Invalid challenges",
        description: "Please add at least one challenge with a name and goal.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Generate invite code
      const { data: inviteData, error: inviteError } = await supabase.rpc('generate_invite_code');
      
      if (inviteError) throw inviteError;
      
      // Create group
      const groupInsert: any = {
        name: name.trim(),
        description: description.trim() || null,
        created_by: user.id,
        invite_code: inviteData
      };

      // Add duration if specified
      if (durationDays && parseInt(durationDays) > 0) {
        groupInsert.duration_days = parseInt(durationDays);
      }

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert(groupInsert)
        .select()
        .single();

      if (groupError) throw groupError;

      // Create challenges
      const challengeInserts = validChallenges.map(challenge => ({
        group_id: groupData.id,
        name: challenge.name.trim(),
        goal_amount: challenge.goal_amount
      }));

      const { error: challengesError } = await supabase
        .from('group_challenges')
        .insert(challengeInserts);

      if (challengesError) throw challengesError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          user_id: user.id,
          group_id: groupData.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Group created!",
        description: `Successfully created "${name}" with ${validChallenges.length} challenge${validChallenges.length > 1 ? 's' : ''}.`,
      });
      
      setName("");
      setDescription("");
      setDurationDays("");
      setChallenges([{ name: "", goal_amount: 0 }]);
      setOpen(false);
      onGroupCreated?.();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Failed to create group",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Challenge Duration (Optional)</Label>
            <Input
              id="duration"
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="Enter number of days (1-1000)"
              min="1"
              max="1000"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty for unlimited duration
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Challenges ({challenges.length}/10)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChallenge}
                disabled={challenges.length >= 10}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {challenges.map((challenge, index) => (
                <div key={index} className="flex gap-2 items-start p-2 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Challenge name (e.g., Push-ups)"
                      value={challenge.name}
                      onChange={(e) => updateChallenge(index, 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Daily goal"
                      value={challenge.goal_amount || ''}
                      onChange={(e) => updateChallenge(index, 'goal_amount', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  {challenges.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChallenge(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={loading || !name.trim()}
          >
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;