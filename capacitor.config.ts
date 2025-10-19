import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.34a8243952a4461b8505c66db6d63a2f",
  appName: "fitness-challange",
  webDir: "dist",
  server: {
    url: "https://34a82439-52a4-461b-8505-c66db6d63a2f.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false,
    },
  },
};

export default config;
