import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import WelcomeScreen from "@/components/WelcomeScreen";
import GroupDashboard from "@/components/groups/GroupDashboard";

const Index = () => {
  const { user, loading } = useAuth();
  const { groups, loading: groupsLoading } = useGroups();
  const navigate = useNavigate();
  
  // Initialize push notifications
  usePushNotifications();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || groupsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {groups.length > 0 ? (
        <GroupDashboard />
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
};

export default Index;
