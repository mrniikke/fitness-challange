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
  log_date: string;
}

interface MemberProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  challenges: Challenge[];
  memberLogs: PushupLog[];
  groupStartDate: string;
}

const MemberProgressDialog = ({
  open,
  onOpenChange,
  memberName,
  challenges,
  memberLogs,
  groupStartDate,
}: MemberProgressDialogProps) => {
  // Helper to get today's date string
  const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString();

  // Get progress for a specific challenge (today only)
  const getProgressForChallenge = (challengeId: string) => {
    const log = memberLogs.find(log => 
      log.challenge_id === challengeId && 
      log.log_date === today
    );
    return log?.pushups || 0;
  };

  // Filter today's logs for overall calculation
  const todayLogs = memberLogs.filter(log => log.challenge_id && log.log_date === today);

  // Calculate overall progress (today)
  const totalCompleted = todayLogs.reduce((sum, log) => sum + log.pushups, 0);
  const totalGoal = challenges.reduce((sum, challenge) => sum + challenge.goal_amount, 0);
  const overallPercentage = totalGoal > 0 ? Math.round((totalCompleted / totalGoal) * 100) : 0;

  // Calculate historical totals (all time)
  const allTimeLogs = memberLogs.filter(log => log.challenge_id);
  const totalHistoricalPushups = allTimeLogs.reduce((sum, log) => sum + log.pushups, 0);
  
  // Calculate days active
  const uniqueDates = new Set(memberLogs.map(log => log.log_date));
  const daysActive = uniqueDates.size;

  // Format group start date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

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
          
          {/* Overall Progress Summary (Today) */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">Overall Progress (Today)</h4>
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

          {/* Historical Total Summary */}
          <div className="pt-4 border-t bg-muted/30 -mx-6 px-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📊</span>
              <h4 className="text-sm font-semibold">Historical Total (All Time)</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Reps Logged:</span>
                <span className="text-2xl font-bold text-primary">{totalHistoricalPushups}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Since:</span>
                <span>{formatDate(groupStartDate)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Days Active:</span>
                <span className="font-medium">{daysActive} day{daysActive !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberProgressDialog;
