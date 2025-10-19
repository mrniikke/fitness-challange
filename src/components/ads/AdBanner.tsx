import { useEffect, useState } from "react";
import { AdMob, BannerAdSize, BannerAdPosition } from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";

interface AdBannerProps {
  position?: "top" | "bottom";
  className?: string;
}

const AdBanner = ({ position = "bottom", className = "" }: AdBannerProps) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AdMob Publisher ID: pub-5029794477992220
  // Platform-specific App IDs and Ad Unit IDs
  const ADMOB_APP_ID =
    Capacitor.getPlatform() === "ios"
      ? "ca-app-pub-5029794477992220~6768117812" // iOS App ID
      : "ca-app-pub-5029794477992220~4772789104"; // Android App ID

  const AD_UNIT_ID =
    Capacitor.getPlatform() === "ios"
      ? "ca-app-pub-5029794477992220/2828872802" // iOS banner ad unit ID
      : "ca-app-pub-5029794477992220/4638849745"; // Android banner ad unit ID

  useEffect(() => {
    const initializeAd = async () => {
      try {
        // Only show ads on mobile platforms
        if (!Capacitor.isNativePlatform()) {
          console.log("Not a native platform, skipping AdMob");
          return;
        }

        console.log("Initializing AdMob...");
        console.log("Platform:", Capacitor.getPlatform());
        console.log("App ID:", ADMOB_APP_ID);
        console.log("Ad Unit ID:", AD_UNIT_ID);

        // Initialize AdMob
        await AdMob.initialize({
          testingDevices: [],
          initializeForTesting: false,
        });

        console.log("AdMob initialized successfully");

        // Show banner ad
        await AdMob.showBanner({
          adId: AD_UNIT_ID,
          adSize: BannerAdSize.BANNER,
          position: position === "top" ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: false,
        });

        console.log("Banner ad requested successfully");
        setIsAdLoaded(true);
      } catch (err) {
        console.error("AdMob error:", err);
        console.error("Error details:", JSON.stringify(err, null, 2));
        setError("Failed to load ad");
      }
    };

    initializeAd();

    // Cleanup function
    return () => {
      if (Capacitor.isNativePlatform()) {
        AdMob.hideBanner().catch(console.error);
      }
    };
  }, [position, AD_UNIT_ID, ADMOB_APP_ID]);

  // Don't show anything if there's an error
  if (error) {
    return null;
  }

  // For web preview, show a placeholder
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className={`bg-muted border border-border rounded-lg p-4 text-center ${className}`}>
        <div className="text-muted-foreground text-sm">📱 Ad Banner (Mobile Only)</div>
        <div className="text-xs text-muted-foreground mt-1">Ads will appear here in the mobile app</div>
      </div>
    );
  }

  // On mobile, the ad is rendered natively by AdMob
  // Return a spacer to account for the ad space
  return (
    <div
      className={`${position === "top" ? "h-12" : "h-16"} ${className}`}
      style={{
        minHeight: position === "top" ? "50px" : "60px",
      }}
    />
  );
};

export default AdBanner;
