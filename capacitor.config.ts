import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.fitnesschallenge",
  appName: "fitness-challange",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false,
    },
    AdMob: {
      appId: {
        ios: "ca-app-pub-5029794477992220~2828872802",
        android: "ca-app-pub-5029794477992220~4638849745"
      }
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
