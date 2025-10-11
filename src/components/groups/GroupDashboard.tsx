import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { useNotifications } from "@/hooks/useNotifications";
import { Users, Plus, Copy, Crown, User, Target, Star, Skull, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreateGroupDialog from "./CreateGroupDialog";
import JoinGroupDialog from "./JoinGroupDialog";
import InviteButton from "./InviteButton";
import SwipeableGroupCard from "./SwipeableGroupCard";
import NotificationPanel from "../notifications/NotificationPanel";
import AdBanner from "../ads/AdBanner";
import MemberProgressDialog from "./MemberProgressDialog";
import AccountMenu from "../AccountMenu";

const GroupDashboard = () => {
  const { signOut, user } = useAuth();
  const { groups, currentGroup, members, loading, challenges, pushupLogs, selectGroup, refreshGroups, logPushups, leaveGroup } = useGroups();
  const { notifications, clearNotifications, removeNotification } = useNotifications(currentGroup?.id);
  const [showGroupList, setShowGroupList] = useState(true);
  const [pushupInputs, setPushupInputs] = useState<{[challengeId: string]: string}>({});
  const [isLogging, setIsLogging] = useState<{[challengeId: string]: boolean}>({});
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by the auth state change
    } catch (error) {
      console.error('Failed to sign out:', error);
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
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

  // Helper function to calculate countdown for groups with time limits
  const getCountdown = () => {
    if (!currentGroup?.end_date) return null;
    
    const now = new Date();
    const endDate = new Date(currentGroup.end_date);
    const timeDiff = endDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return { expired: true };
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours, expired: false };
  };

  // Helper function to get local date string (not affected by timezone conversion to UTC)
  const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get current progress for a challenge
  const getCurrentProgress = (challengeId: string) => {
    if (!user) return 0;
    const today = getLocalDateString();
    const todayLog = pushupLogs.find(log => 
      log.user_id === user.id && 
      log.challenge_id === challengeId && 
      log.log_date === today
    );
    return todayLog?.pushups || 0;
  };

  // Helper function to check if challenge goal is reached
  const isGoalReached = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return false;
    const currentProgress = getCurrentProgress(challengeId);
    return currentProgress >= challenge.goal_amount;
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

    // Check if goal would be exceeded
    const challenge = challenges.find(c => c.id === challengeId);
    const currentProgress = getCurrentProgress(challengeId);
    if (challenge && currentProgress + pushups > challenge.goal_amount) {
      const remaining = challenge.goal_amount - currentProgress;
      toast({
        title: "Goal exceeded",
        description: `You can only log ${remaining} more to reach your daily goal of ${challenge.goal_amount}.`,
        variant: "destructive",
      });
      return;
    }

    setIsLogging(prev => ({ ...prev, [challengeId]: true }));
    try {
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
    } catch (error) {
      console.error("Error in handleLogPushups:", error);
      toast({
        title: "Failed to log progress",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLogging(prev => ({ ...prev, [challengeId]: false }));
    }
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
              <h1 className="text-3xl font-bold text-foreground">You are awesome</h1>
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
              <AccountMenu className="ml-2" />
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
                      Start a new fitness challenge with friends
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

          {/* Ad Banner */}
          <AdBanner position="bottom" className="my-6" />

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

          {/* Ad Banner */}
          <AdBanner position="bottom" className="mt-6" />
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
        <div className="space-y-2">
          {challenges.map((challenge) => {
            const currentProgress = getCurrentProgress(challenge.id);
            const goalReached = isGoalReached(challenge.id);
            const remaining = challenge.goal_amount - currentProgress;
            
            return (
              <Card key={challenge.id} className="border-0 bg-gradient-card shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        {goalReached ? (
                          <Target className="h-4 w-4 text-green-500" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        {challenge.name}
                        {goalReached && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 px-2 py-0">
                            Complete 🎉
                          </Badge>
                        )}
                      </h3>
                      <div className="text-xs text-muted-foreground">
                        {currentProgress} / {challenge.goal_amount}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={goalReached ? "Goal completed!" : `Enter count`}
                        value={pushupInputs[challenge.id] || ''}
                        onChange={(e) => setPushupInputs(prev => ({ ...prev, [challenge.id]: e.target.value }))}
                        min="0"
                        max={goalReached ? 0 : remaining}
                        disabled={goalReached}
                        className="h-8"
                      />
                      <Button 
                        onClick={() => handleLogPushups(challenge.id)}
                        disabled={goalReached || !!isLogging[challenge.id] || !pushupInputs[challenge.id]?.trim()}
                        size="sm"
                        className="h-8 px-3"
                      >
                        {isLogging[challenge.id] ? "..." : goalReached ? "✓" : "Log"}
                      </Button>
                    </div>
                    
                    {currentProgress > 0 && (
                      <Progress 
                        value={Math.min((currentProgress / challenge.goal_amount) * 100, 100)} 
                        className="h-1.5" 
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Countdown Timer for Groups with Time Limits */}
        {currentGroup.end_date && (
          <Card className="border-0 bg-gradient-card shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-center">
                  {(() => {
                    const countdown = getCountdown();
                    if (!countdown) return null;
                    
                    if (countdown.expired) {
                      return (
                        <div className="text-sm">
                          <span className="font-medium text-destructive">Challenge Expired</span>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="text-sm">
                        <span className="font-medium text-foreground">
                          {countdown.days} day{countdown.days !== 1 ? 's' : ''}
                          {countdown.hours > 0 && `, ${countdown.hours} hour${countdown.hours !== 1 ? 's' : ''}`}
                        </span>
                        <span className="text-muted-foreground"> remaining</span>
                      </div>
                    );
                  })()}
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}


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
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setSelectedMember(member)}
                              className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer underline decoration-dotted"
                            >
                              {member.profiles?.display_name || member.profiles?.username || 'Unknown User'}
                              {isCurrentUser && " (You)"}
                            </button>
                            {member.showSkull && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="cursor-pointer hover:scale-110 transition-transform">
                                    💀
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64">
                                  <p className="text-sm text-foreground">
                                    You got this skull because of your laziness. Get rid of it by completing your challenges!
                                  </p>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
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

        {/* Ad Banner */}
        <AdBanner position="bottom" className="mt-6" />

        {/* Member Progress Dialog */}
        {selectedMember && (
          <MemberProgressDialog
            open={!!selectedMember}
            onOpenChange={(open) => !open && setSelectedMember(null)}
            memberName={selectedMember.profiles?.display_name || selectedMember.profiles?.username || 'Unknown User'}
            challenges={challenges}
            memberLogs={pushupLogs.filter(log => log.user_id === selectedMember.user_id)}
            groupStartDate={currentGroup.created_at}
          />
        )}
      </div>
    </div>
  );
};

export default GroupDashboard;