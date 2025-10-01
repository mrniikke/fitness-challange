import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

interface Challenge {
  id: string;
  name: string;
  goal_amount: number;
}

interface PushupLog {
  challenge_id?: string | null;
  pushups: number;
}

interface MemberProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  challenges: Challenge[];
  memberLogs: PushupLog[];
}

const MemberProgressDialog = ({
  open,
  onOpenChange,
  memberName,
  challenges,
  memberLogs,
}: MemberProgressDialogProps) => {
  // Get progress for a specific challenge
  const getProgressForChallenge = (challengeId: string) => {
    const log = memberLogs.find(log => log.challenge_id === challengeId);
    return log?.pushups || 0;
  };

  // Filter out logs without challenge_id for overall calculation
  const validLogs = memberLogs.filter(log => log.challenge_id);

  // Calculate overall progress
  const totalCompleted = validLogs.reduce((sum, log) => sum + log.pushups, 0);
  const totalGoal = challenges.reduce((sum, challenge) => sum + challenge.goal_amount, 0);
  const overallPercentage = totalGoal > 0 ? Math.round((totalCompleted / totalGoal) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {memberName}'s Progress
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {challenges.map((challenge) => {
            const completed = getProgressForChallenge(challenge.id);
            const percentage = Math.round((completed / challenge.goal_amount) * 100);
            const isComplete = completed >= challenge.goal_amount;
            
            return (
              <div key={challenge.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    💪 {challenge.name}
                    {isComplete && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Complete
                      </Badge>
                    )}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {completed}/{challenge.goal_amount}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {percentage}%
                  </p>
                </div>
              </div>
            );
          })}
          
          {/* Overall Progress Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">Overall Progress</h4>
              <span className="text-sm font-medium">
                {totalCompleted}/{totalGoal}
              </span>
            </div>
            <div className="space-y-1">
              <Progress value={overallPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground text-right">
                {overallPercentage}% complete
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberProgressDialog;
