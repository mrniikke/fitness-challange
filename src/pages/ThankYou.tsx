import { useEffect } from "react";

const ThankYou = () => {
  useEffect(() => {
    document.title = "Email Verified - Thank You | Fitness Challenge";
    // Meta description
    const metaName = 'description';
    let meta = document.querySelector(`meta[name="${metaName}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = metaName;
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Email verified. Thank you for joining the Fitness Challenge app. You can return to the app and start logging your progress.');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/thank_you`;
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Email Verified - Thank You 🎉
        </h1>
        <p className="text-lg text-muted-foreground">
          Thank you for creating an account. You can close this window and go back to the app. 
          Hope this app will get you and your friends get motivated. You are awesome!
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
