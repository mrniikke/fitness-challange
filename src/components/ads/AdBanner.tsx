import { useEffect, useState } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

interface AdBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
}

const AdBanner = ({ position = 'bottom', className = '' }: AdBannerProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAdMob = async () => {
      // Only run on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('AdMob: Not running on native platform, skipping initialization');
        return;
      }

      try {
        console.log('AdMob: Initializing...');
        
        // Initialize AdMob
        await AdMob.initialize({
          testingDevices: [],
          initializeForTesting: false, // Set to true during development
        });

        console.log('AdMob: Initialized successfully');
        setIsInitialized(true);

        // Listen for ad events
        AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
          console.log('AdMob: Banner ad loaded');
          setAdError(null);
        });

        AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
          console.error('AdMob: Banner ad failed to load:', error);
          setAdError('Failed to load ad');
        });

        // Show banner ad
        const platform = Capacitor.getPlatform();
        const adUnitId = platform === 'ios' 
          ? 'ca-app-pub-5029794477992220/2828872802'  // iOS Banner Ad Unit ID
          : 'ca-app-pub-5029794477992220/4638849745'; // Android Banner Ad Unit ID

        console.log(`AdMob: Showing banner for ${platform} with ID: ${adUnitId}`);

        await AdMob.showBanner({
          adId: adUnitId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: false, // Set to true during development
        });

        console.log('AdMob: Banner displayed');
      } catch (error) {
        console.error('AdMob: Error initializing or showing banner:', error);
        setAdError('Error initializing ads');
      }
    };

    initializeAdMob();

    // Cleanup function
    return () => {
      if (Capacitor.isNativePlatform() && isInitialized) {
        AdMob.hideBanner().catch(err => 
          console.error('AdMob: Error hiding banner on cleanup:', err)
        );
      }
    };
  }, [position]);

  // Don't render anything on web
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  // Show error state if needed (optional)
  if (adError) {
    return (
      <div className={`p-2 text-center text-xs text-muted-foreground ${className}`}>
        {/* You can show error or just hide it */}
      </div>
    );
  }

  // Reserve space for the ad banner to prevent layout shift
  return (
    <div className={`h-12 w-full ${className}`} />
  );
};

export default AdBanner;
