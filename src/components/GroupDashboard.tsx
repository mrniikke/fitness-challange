import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, Users, Target } from "lucide-react";

interface GroupMember {
  id: string;
  name: string;
  pushups: number;
  hasDailyStar: boolean;
}

const mockMembers: GroupMember[] = [
  { id: "1", name: "Alex", pushups: 45, hasDailyStar: true },
  { id: "2", name: "Emma", pushups: 32, hasDailyStar: false },
  { id: "3", name: "You", pushups: 28, hasDailyStar: false },
];

const GroupDashboard = () => {
  const dailyGoal = 200;
  const totalPushups = mockMembers.reduce((sum, member) => sum + member.pushups, 0);
  const progressPercentage = Math.min((totalPushups / dailyGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">Fitness Squad</h1>
          <p className="text-sm text-muted-foreground">Daily Challenge Progress</p>
        </div>

        {/* Daily Progress Card */}
        <Card className="border-0 bg-gradient-card shadow-medium">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Daily Goal</span>
              </div>
              <Badge variant="secondary" className="bg-primary-soft text-primary">
                {totalPushups}/{dailyGoal}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {dailyGoal - totalPushups > 0 ? `${dailyGoal - totalPushups} left` : "Goal reached!"}
              </span>
              <span className="font-semibold text-primary">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Log Push-ups Button */}
        <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold">
          <Plus className="mr-2 h-5 w-5" />
          Log Push-ups
        </Button>

        {/* Members List */}
        <Card className="border-0 bg-gradient-card shadow-medium">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Group Members</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-card-soft rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{member.name}</span>
                      {member.hasDailyStar && (
                        <Star className="h-4 w-4 fill-star text-star" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {member.pushups} push-ups today
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">{member.pushups}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 bg-accent-soft shadow-medium">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">3</div>
              <div className="text-sm text-muted-foreground">Days Active</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-primary-soft shadow-medium">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">28</div>
              <div className="text-sm text-muted-foreground">Your Today</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GroupDashboard;