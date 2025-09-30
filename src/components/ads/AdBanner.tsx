import { useEffect, useState } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

interface AdBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
}

const AdBanner = ({ position = 'bottom', className = '' }: AdBannerProps) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test Ad Unit IDs (replace with your real ones in production)
  const AD_UNIT_ID = Capacitor.getPlatform() === 'ios' 
    ? 'ca-app-pub-5029794477992220/2828872802' // iOS test banner
    : 'ca-app-pub-3940256099942544/6300978111'; // Android test banner

  useEffect(() => {
    const initializeAd = async () => {
      try {
        // Only show ads on mobile platforms
        if (!Capacitor.isNativePlatform()) {
          return;
        }

        // Initialize AdMob
        await AdMob.initialize({
          testingDevices: ['YOUR_DEVICE_ID'], // Add your test device ID
          initializeForTesting: true,
        });

        // Show banner ad
        await AdMob.showBanner({
          adId: AD_UNIT_ID,
          adSize: BannerAdSize.BANNER,
          position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: false, // Set to false in production
        });

        setIsAdLoaded(true);
      } catch (err) {
        console.error('AdMob initialization error:', err);
        setError('Failed to load ad');
      }
    };

    initializeAd();

    // Cleanup function
    return () => {
      if (Capacitor.isNativePlatform()) {
        AdMob.hideBanner().catch(console.error);
      }
    };
  }, [position]);

  // Show placeholder on web, return null only if there's an error
  if (error) {
    return null;
  }

  // For web preview, show a placeholder
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className={`bg-muted border border-border rounded-lg p-4 text-center ${className}`}>
        <div className="text-muted-foreground text-sm">
          📱 Ad Banner (Mobile Only)
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Ads will appear here in the mobile app
        </div>
      </div>
    );
  }

  // On mobile, the ad is rendered natively by AdMob
  // We return a small spacer to account for the ad space
  return (
    <div 
      className={`${position === 'top' ? 'h-12' : 'h-16'} ${className}`}
      style={{ 
        // Reserve space for the banner ad
        minHeight: position === 'top' ? '50px' : '60px' 
      }}
    />
  );
};

export default AdBanner;