import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { Users, Plus, Copy, Crown, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreateGroupDialog from "./CreateGroupDialog";
import JoinGroupDialog from "./JoinGroupDialog";

const GroupDashboard = () => {
  const { signOut, user } = useAuth();
  const { groups, currentGroup, members, loading, selectGroup, refreshGroups } = useGroups();
  const [showGroupList, setShowGroupList] = useState(true);
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
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
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
                  <Card 
                    key={group.id} 
                    className="cursor-pointer transition-all hover:shadow-lg border-0 bg-gradient-card shadow-medium"
                    onClick={() => selectGroupAndHideList(group)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge variant={group.role === 'admin' ? 'default' : 'secondary'}>
                          {group.role === 'admin' ? (
                            <><Crown className="h-3 w-3 mr-1" /> Admin</>
                          ) : (
                            <><User className="h-3 w-3 mr-1" /> Member</>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Invite: {group.invite_code}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyInviteCode(group.invite_code);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                <h3 className="font-semibold text-foreground mb-1">Invite Code</h3>
                <p className="text-sm text-muted-foreground">
                  Share this code with friends to invite them
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-3 py-2 rounded font-mono text-sm">
                  {currentGroup.invite_code}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteCode(currentGroup.invite_code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card className="border-0 bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">
                      {member.profiles?.display_name || member.profiles?.username || 'Unknown User'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                    {member.role === 'admin' ? (
                      <><Crown className="h-3 w-3 mr-1" /> Admin</>
                    ) : (
                      <><User className="h-3 w-3 mr-1" /> Member</>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Section - Placeholder for future push-up tracking */}
        <Card className="border-0 bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle>Group Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Push-up tracking coming soon! Start logging your daily progress.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupDashboard;