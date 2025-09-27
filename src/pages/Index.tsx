import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import GroupDashboard from "@/components/GroupDashboard";
import PushupLogger from "@/components/PushupLogger";

type AppScreen = "welcome" | "dashboard" | "logger";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("welcome");

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen />;
      case "dashboard":
        return <GroupDashboard />;
      case "logger":
        return <PushupLogger onBack={() => setCurrentScreen("dashboard")} />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="font-sans">
      {renderScreen()}
      
      {/* Demo Navigation (temporary for showcase) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-medium border">
        <button
          onClick={() => setCurrentScreen("welcome")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            currentScreen === "welcome" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Welcome
        </button>
        <button
          onClick={() => setCurrentScreen("dashboard")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            currentScreen === "dashboard" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentScreen("logger")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            currentScreen === "logger" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Logger
        </button>
      </div>
    </div>
  );
};

export default Index;
