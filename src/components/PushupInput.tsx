import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PushupInputProps {
  onLogPushups: (pushups: number) => Promise<boolean>;
}

const PushupInput = ({ onLogPushups }: PushupInputProps) => {
  const [pushups, setPushups] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pushupsNum = parseInt(pushups);
    if (isNaN(pushupsNum) || pushupsNum <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number of push-ups",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const success = await onLogPushups(pushupsNum);
    
    if (success) {
      toast({
        title: "Push-ups logged!",
        description: `Added ${pushupsNum} push-ups to your daily total`,
      });
      setPushups("");
    } else {
      toast({
        title: "Error",
        description: "Failed to log push-ups. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="number"
        placeholder="Enter push-ups"
        value={pushups}
        onChange={(e) => setPushups(e.target.value)}
        min="1"
        className="flex-1"
      />
      <Button type="submit" disabled={loading} size="sm">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default PushupInput;