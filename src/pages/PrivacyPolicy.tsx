const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
            <p className="text-muted-foreground">
              This Privacy Policy describes how we collect, use, and protect your personal information when you use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
            <p className="text-muted-foreground mb-2">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Account information (email, username, display name)</li>
              <li>Profile information</li>
              <li>Activity data (pushup logs, challenge completions)</li>
              <li>Group membership and interactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-2">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Provide and maintain our services</li>
              <li>Track your progress and achievements</li>
              <li>Enable group features and social interactions</li>
              <li>Send you notifications and updates</li>
              <li>Improve our application and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Advertising and Analytics</h2>
            <p className="text-muted-foreground mb-2">
              We use Google AdMob to display advertisements in our app. AdMob automatically collects certain information about you and your device, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Device identifiers (IDFA on iOS, Advertising ID on Android)</li>
              <li>IP address and approximate location</li>
              <li>Device information (model, operating system version, screen size)</li>
              <li>Ad interaction data (ad views, clicks, and conversions)</li>
              <li>App usage information (session duration, frequency of use)</li>
              <li>Precise location data (only if you grant permission)</li>
            </ul>
            <p className="text-muted-foreground mt-2 mb-2">
              This information is used to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Serve personalized advertisements</li>
              <li>Measure ad performance and effectiveness</li>
              <li>Prevent fraud and improve ad security</li>
              <li>Provide analytics about ad engagement</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              For more information about how Google uses data, please visit Google's Privacy Policy at <a href="https://policies.google.com/privacy" className="text-primary underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>
            </p>
            <p className="text-muted-foreground mt-2">
              You can opt out of personalized advertising by adjusting your device settings (iOS: Settings → Privacy → Tracking; Android: Settings → Google → Ads → Opt out of Ads Personalization).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Sharing</h2>
            <p className="text-muted-foreground mb-2">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Other members of groups you join (activity data only)</li>
              <li>Google AdMob and its advertising partners (device and usage data for ad purposes)</li>
              <li>Service providers who help us operate our app</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              We may share aggregated, anonymized data for analytical purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
            <p className="text-muted-foreground mb-2">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of certain data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at NP.Development2025@gmail.com
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
