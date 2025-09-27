import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import heroFitness from "@/assets/hero-fitness.png";

const WelcomeScreen = () => {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
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
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Create Group
                </Button>
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
                <Button variant="outline" className="w-full border-border hover:bg-secondary">
                  Join Group
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info & Sign Out */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Welcome, {user?.email}!
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="text-xs"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;