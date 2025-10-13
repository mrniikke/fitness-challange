import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Trash2, Database, Users, Activity } from "lucide-react";

const DeleteAccount = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <Trash2 className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Delete Your Account</h1>
          <p className="text-muted-foreground text-lg">
            Understand what happens when you delete your account
          </p>
        </div>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">How to Delete Your Account</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Navigate to the main page after logging in</li>
                <li>Click on the "Menu" button below your email</li>
                <li>Select "Delete Account" from the dropdown</li>
                <li>Confirm the deletion in the dialog that appears</li>
              </ol>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-foreground">What Gets Deleted</h3>
              <p className="text-sm text-muted-foreground">
                When you delete your account, the following information is permanently removed:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Profile Information</p>
                    <p className="text-sm text-muted-foreground">Your username, display name, and all profile data</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Activity Logs</p>
                    <p className="text-sm text-muted-foreground">All your workout logs and progress data</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Group Memberships</p>
                    <p className="text-sm text-muted-foreground">Your membership in all groups and related data</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Authentication Data</p>
                    <p className="text-sm text-muted-foreground">Your email, password, and login credentials</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium text-destructive">
                ⚠️ This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
