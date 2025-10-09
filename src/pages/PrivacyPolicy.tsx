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
            <h2 className="text-2xl font-semibold mb-3">Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. Your activity data may be visible to other members of groups you join. We may share aggregated, anonymized data for analytical purposes.
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
