import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AccountMenuProps {
  email?: string | null;
  className?: string;
}

const AccountMenu = ({ email, className }: AccountMenuProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // Redirect handled by Index route when user becomes null
  };

  const handleDelete = async () => {
    try {
      // Delete all user data from public tables (in correct order)
      const { error: rpcError } = await supabase.rpc("delete_user_account");
      if (rpcError) {
        console.error('Failed to delete user data:', rpcError);
        throw rpcError;
      }

      toast({ title: "Account deleted", description: "Your account and all data have been removed." });
      
      // Sign out (will redirect to login)
      await signOut();
    } catch (e) {
      console.error('Account deletion error:', e);
      toast({ title: "Deletion failed", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className={className}>
      {email && (
        <p className="mb-2 text-sm text-muted-foreground">Welcome, {email}!</p>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            Menu
            <ChevronDown className="ml-2 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48 z-[100] bg-popover">
          <DropdownMenuItem onClick={() => navigate("/support")} className="cursor-pointer">
            Support
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            Sign Out
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenConfirm(true)}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your account and all data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountMenu;
