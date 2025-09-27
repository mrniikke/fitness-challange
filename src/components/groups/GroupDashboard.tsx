import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { useNotifications } from "@/hooks/useNotifications";
import { Users, Plus, Copy, Crown, User, Target, Star, Skull } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreateGroupDialog from "./CreateGroupDialog";
import JoinGroupDialog from "./JoinGroupDialog";
import InviteButton from "./InviteButton";
import SwipeableGroupCard from "./SwipeableGroupCard";
import NotificationPanel from "../notifications/NotificationPanel";

const GroupDashboard = () => {
  const { signOut, user } = useAuth();
  const { groups, currentGroup, members, loading, challenges, selectGroup, refreshGroups, logPushups, leaveGroup } = useGroups();
  const { notifications, clearNotifications, removeNotification } = useNotifications(currentGroup?.id);
  const [showGroupList, setShowGroupList] = useState(true);
  const [pushupInputs, setPushupInputs] = useState<{[challengeId: string]: string}>({});
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleGroupCreated = () => {
    refreshGroups();
  };

  const handleGroupJoined = () => {
    refreshGroups();
  };

  const copyInviteCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Invite code copied!",
      description: "Share this code with friends to invite them to your group.",
    });
  };

  const selectGroupAndHideList = (group: any) => {
    selectGroup(group);
    setShowGroupList(false);
  };

  const handleLeaveGroup = async (groupId: string) => {
    const result = await leaveGroup(groupId);
    
    if (result.success) {
      toast({
        title: "Left group successfully",
        description: "You have been removed from the group.",
      });
    } else {
      toast({
        title: "Failed to leave group",
        description: result.error || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleLogPushups = async (challengeId: string) => {
    if (!currentGroup || !pushupInputs[challengeId]?.trim()) return;
    
    const pushups = parseInt(pushupInputs[challengeId]);
    if (isNaN(pushups) || pushups < 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number.",
        variant: "destructive",
      });
      return;
    }

    setIsLogging(true);
    const success = await logPushups(currentGroup.id, challengeId, pushups);
    
    if (success) {
      const challenge = challenges.find(c => c.id === challengeId);
      toast({
        title: "Progress logged!",
        description: `Successfully logged ${pushups} for ${challenge?.name || 'challenge'}.`,
      });
      setPushupInputs(prev => ({ ...prev, [challengeId]: "" }));
    } else {
      toast({
        title: "Failed to log progress",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setIsLogging(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading your groups...</div>
      </div>
    );
  }

  if (showGroupList || !currentGroup) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Groups</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email}!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationPanel 
                notifications={notifications}
                onClear={clearNotifications}
                onRemove={removeNotification}
              />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Create/Join Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 bg-gradient-card shadow-medium">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Create a Group</h3>
                    <p className="text-sm text-muted-foreground">
                      Start a new push-up challenge with friends
                    </p>
                  </div>
                  <CreateGroupDialog onGroupCreated={handleGroupCreated} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-card shadow-medium">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Join a Group</h3>
                    <p className="text-sm text-muted-foreground">
                      Join an existing challenge with an invite code
                    </p>
                  </div>
                  <JoinGroupDialog onGroupJoined={handleGroupJoined} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Groups List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Your Groups</h2>
            
            {groups.length === 0 ? (
              <Card className="border border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No groups yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first group or join an existing one to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <SwipeableGroupCard
                    key={group.id}
                    group={group}
                    onSelect={selectGroupAndHideList}
                    onLeave={handleLeaveGroup}
                    onCopyInvite={copyInviteCode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Group Detail View
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setShowGroupList(true)}
              className="mb-2 p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
            >
              ← Back to groups
            </Button>
            <h1 className="text-3xl font-bold text-foreground">{currentGroup.name}</h1>
            {currentGroup.description && (
              <p className="text-muted-foreground">{currentGroup.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <NotificationPanel 
              notifications={notifications}
              onClear={clearNotifications}
              onRemove={removeNotification}
            />
            <Badge variant={currentGroup.role === 'admin' ? 'default' : 'secondary'}>
              {currentGroup.role === 'admin' ? (
                <><Crown className="h-3 w-3 mr-1" /> Admin</>
              ) : (
                <><User className="h-3 w-3 mr-1" /> Member</>
              )}
            </Badge>
          </div>
        </div>

        {/* Invite Code */}
        <Card className="border-0 bg-gradient-card shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Invite Friends</h3>
                <p className="text-sm text-muted-foreground">
                  Share your group and grow your challenge community
                </p>
              </div>
              <div className="flex items-center gap-2">
                <InviteButton 
                  groupName={currentGroup.name}
                  inviteCode={currentGroup.invite_code}
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono">
                  Invite Code: {currentGroup.invite_code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyInviteCode(currentGroup.invite_code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log Progress Section */}
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="border-0 bg-gradient-card shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Log Your Progress - {challenge.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={`Enter ${challenge.name.toLowerCase()} count`}
                    value={pushupInputs[challenge.id] || ''}
                    onChange={(e) => setPushupInputs(prev => ({ ...prev, [challenge.id]: e.target.value }))}
                    min="0"
                  />
                  <Button 
                    onClick={() => handleLogPushups(challenge.id)}
                    disabled={isLogging || !pushupInputs[challenge.id]?.trim()}
                    className="min-w-[100px]"
                  >
                    {isLogging ? "Logging..." : "Log"}
                  </Button>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Daily Goal: {challenge.goal_amount}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Members Progress */}
        <Card className="border-0 bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members Progress ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => {
                const todayPushups = member.todayPushups || 0;
                const totalGoal = challenges.reduce((sum, challenge) => sum + challenge.goal_amount, 0);
                const progressPercentage = Math.min((todayPushups / Math.max(totalGoal, 1)) * 100, 100);
                const isCurrentUser = member.user_id === user?.id;
                
                return (
                  <div key={member.id} className="space-y-2">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className="font-medium text-foreground">
                           {member.profiles?.display_name || member.profiles?.username || 'Unknown User'}
                           {isCurrentUser && " (You)"}
                         </span>
                         <div className="flex items-center gap-1">
                           <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                             {member.role === 'admin' ? (
                               <><Crown className="h-3 w-3 mr-1" /> Admin</>
                             ) : (
                               <><User className="h-3 w-3 mr-1" /> Member</>
                             )}
                           </Badge>
                           {member.isFirstFinisher && member.completionStatus === 'completed' && (
                             <div title="First to complete today's goal!">
                               <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                             </div>
                           )}
                           {member.completionStatus === 'failed' && (
                             <div title="Didn't reach today's goal">
                               <Skull className="h-4 w-4 text-gray-600" />
                             </div>
                           )}
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="font-semibold text-primary">{todayPushups}</div>
                         <div className="text-xs text-muted-foreground">{progressPercentage.toFixed(0)}%</div>
                       </div>
                     </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{todayPushups} / {totalGoal}</span>
                      <span>
                        {totalGoal - todayPushups > 0 ? `${totalGoal - todayPushups} remaining` : "Goal reached! 🎉"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupDashboard;