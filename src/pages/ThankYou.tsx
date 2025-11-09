import { App } from '@capacitor/app';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
const ThankYou = () => {
  const handleBackToApp = async () => {
    try {
      // Try to minimize/close the browser and return to app
      await App.minimizeApp();
    } catch (error) {
      // If minimizeApp fails (e.g., on web), try to close the window
      window.close();
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const token_hash = url.searchParams.get('token_hash');
        const type = url.searchParams.get('type');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (import.meta.env.DEV && error) console.error('exchangeCodeForSession error', error);
        } else if (token_hash && type) {
          // Handle email confirmation links (e.g., type=signup)
          const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
          if (import.meta.env.DEV && error) console.error('verifyOtp error', error);
        } else if (window.location.hash.includes('access_token') && window.location.hash.includes('refresh_token')) {
          const params = new URLSearchParams(window.location.hash.substring(1));
          const access_token = params.get('access_token') ?? '';
          const refresh_token = params.get('refresh_token') ?? '';
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (import.meta.env.DEV && error) console.error('setSession error', error);
          }
        }
      } catch (e) {
        if (import.meta.env.DEV) console.error('Auth callback handling failed', e);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Thank You! 🎉
        </h1>
        <p className="text-lg text-muted-foreground">
          Thank you for creating an account. You can close this window and go back to the app. 
          Hope this app will get you and your friends get motivated. You are awesome!
        </p>
        <Button 
          onClick={handleBackToApp}
          size="lg"
          className="w-full max-w-xs"
        >
          Back to App
        </Button>
      </div>
    </div>
  );
};

export default ThankYou;
