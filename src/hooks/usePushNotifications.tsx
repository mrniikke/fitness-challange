import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    plugins?: {
      OneSignal?: {
        setAppId: (appId: string) => void;
        setNotificationOpenedHandler: (handler: (data: any) => void) => void;
        promptForPushNotificationsWithUserResponse: (callback: (accepted: boolean) => void) => void;
        getDeviceState: (callback: (state: { userId?: string }) => void) => void;
      };
    };
  }
}

export const usePushNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform() || !user) {
      console.log('Push notifications: Not on native platform or no user');
      return;
    }

    const initializeOneSignal = async () => {
      try {
        console.log('Initializing OneSignal...');

        // Wait for OneSignal to be available
        const checkOneSignal = () => {
          return new Promise<void>((resolve) => {
            const check = () => {
              if (window.plugins?.OneSignal) {
                resolve();
              } else {
                setTimeout(check, 100);
              }
            };
            check();
          });
        };

        await checkOneSignal();

        const OneSignal = window.plugins!.OneSignal!;

        // Get OneSignal App ID from environment
        const appId = import.meta.env.VITE_ONESIGNAL_APP_ID || 'YOUR_ONESIGNAL_APP_ID';
        
        // Initialize OneSignal
        OneSignal.setAppId(appId);

        // Set notification opened handler
        OneSignal.setNotificationOpenedHandler((data) => {
          console.log('Notification opened:', data);
          // Handle notification tap if needed
        });

        // Request permission
        OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
          console.log('User accepted push notifications:', accepted);
          
          if (accepted) {
            // Get device state to retrieve player ID
            OneSignal.getDeviceState((state) => {
              const playerId = state.userId;
              console.log('OneSignal Player ID:', playerId);
              
              if (playerId) {
                // Save player ID to database
                supabase
                  .from('user_push_tokens')
                  .upsert({
                    user_id: user.id,
                    player_id: playerId,
                  }, {
                    onConflict: 'user_id,player_id'
                  })
                  .then(({ error }) => {
                    if (error) {
                      console.error('Error saving push token:', error);
                    } else {
                      console.log('Push token saved successfully');
                    }
                  });
              }
            });
          }
        });

        console.log('OneSignal initialized successfully');
      } catch (error) {
        console.error('Error initializing OneSignal:', error);
      }
    };

    // Initialize after a short delay to ensure everything is loaded
    setTimeout(initializeOneSignal, 1000);
  }, [user]);
};
