import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import WelcomeScreen from "@/components/WelcomeScreen";
import GroupDashboard from "@/components/GroupDashboard";
import { useState } from "react";

const Index = () => {
  const [hasGroup, setHasGroup] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
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
      {hasGroup ? (
        <GroupDashboard />
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
};

export default Index;
