import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus } from "lucide-react";

const PushupLogger = ({ onBack }: { onBack: () => void }) => {
  const [count, setCount] = useState(0);
  const [isLogging, setIsLogging] = useState(false);

  const quickAmounts = [5, 10, 20, 50];
  
  const addQuickAmount = (amount: number) => {
    setCount(prev => prev + amount);
  };

  const adjustCount = (delta: number) => {
    setCount(prev => Math.max(0, prev + delta));
  };

  const handleLog = async () => {
    if (count <= 0) return;
    
    setIsLogging(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLogging(false);
    
    // Show success feedback
    alert(`Logged ${count} push-ups! 💪`);
    setCount(0);
    onBack();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Log Push-ups</h1>
            <p className="text-sm text-muted-foreground">Add to your daily total</p>
          </div>
        </div>

        {/* Count Display */}
        <Card className="border-0 bg-gradient-card shadow-medium">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div>
                <div className="text-4xl font-bold text-primary">{count}</div>
                <div className="text-muted-foreground">push-ups</div>
              </div>
              
              {/* Manual Adjustment */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustCount(-1)}
                  disabled={count <= 0}
                  className="h-10 w-10 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center"
                  min="0"
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustCount(1)}
                  className="h-10 w-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Add Buttons */}
        <Card className="border-0 bg-gradient-card shadow-medium">
          <CardHeader className="pb-4">
            <h3 className="font-semibold text-foreground">Quick Add</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => addQuickAmount(amount)}
                  className="h-12 text-lg font-semibold hover:bg-primary-soft hover:border-primary hover:text-primary"
                >
                  +{amount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="border-0 bg-gradient-card shadow-medium">
          <CardHeader className="pb-4">
            <h3 className="font-semibold text-foreground">Today's Sessions</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card-soft rounded-xl">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-primary-soft text-primary">
                  9:30 AM
                </Badge>
                <span className="text-foreground">Morning set</span>
              </div>
              <span className="font-semibold text-primary">15 push-ups</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-card-soft rounded-xl">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-accent-soft text-accent">
                  12:15 PM
                </Badge>
                <span className="text-foreground">Lunch break</span>
              </div>
              <span className="font-semibold text-accent">13 push-ups</span>
            </div>
          </CardContent>
        </Card>

        {/* Log Button */}
        <Button 
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
          onClick={handleLog}
          disabled={count <= 0 || isLogging}
        >
          {isLogging ? "Logging..." : `Log ${count} Push-ups`}
        </Button>
      </div>
    </div>
  );
};

export default PushupLogger;