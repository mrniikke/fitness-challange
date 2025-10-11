import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroFitness from "@/assets/hero-fitness.png";
import CreateGroupDialog from "@/components/groups/CreateGroupDialog";
import JoinGroupDialog from "@/components/groups/JoinGroupDialog";

const WelcomeScreen = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) throw error;

      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });

      await signOut();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="mx-auto w-full max-w-sm">
            <img 
              src={heroFitness} 
              alt="Push-up Challenger - Fitness motivation"
              className="w-full h-auto rounded-2xl shadow-soft"
            />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              Push-up Challenger
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Challenge friends, track progress, and stay motivated together
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          <Card className="border-0 bg-gradient-card shadow-medium">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Create a Group</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a new challenge with your friends
                  </p>
                </div>
                <CreateGroupDialog />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-card shadow-medium">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Join a Group</h3>
                  <p className="text-sm text-muted-foreground">
                    Join your friends' challenge with an invite code
                  </p>
                </div>
                <JoinGroupDialog />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info & Account Menu */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Welcome, {user?.email}!
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                Account
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem onClick={handleSignOut}>
                Sign Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/support")}>
                Support
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
              All your data, including groups and progress, will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WelcomeScreen;