import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Marketing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Get fit together with Fitness Challenge! 💪
          </h1>
          
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground">
            <p>
              Challenge friends, family, or coworkers with fun workout goals. Choose exercises like push-ups, sit-ups, or squats, set your daily reps, and motivate each other to reach your goals!
            </p>
            
            <p>
              Stay inspired, track your progress, and make fitness fun together.
            </p>
            
            <p className="font-medium text-foreground">
              Perfect for anyone who wants to start training, keep going – and enjoy the journey!
            </p>
          </div>

          <div className="pt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/")}
              className="text-lg px-8"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
