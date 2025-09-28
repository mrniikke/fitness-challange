# AdMob Setup Guide

## 1. Create AdMob Account
1. Go to [AdMob Console](https://apps.admob.com/)
2. Sign in with your Google account
3. Create a new AdMob account if you don't have one

## 2. Add Your App
1. Click "Apps" in the left sidebar
2. Click "Add app"
3. Select your platform (iOS/Android)
4. Enter your app details:
   - App name: "fitness-challange"
   - Platform: iOS and/or Android

## 3. Create Ad Units
For each platform, create a banner ad unit:

### iOS Banner Ad Unit:
1. Go to your iOS app → Ad units
2. Click "Add ad unit"
3. Select "Banner"
4. Name: "iOS Banner Ad"
5. Copy the Ad unit ID (starts with `ca-app-pub-`)

### Android Banner Ad Unit:
1. Go to your Android app → Ad units  
2. Click "Add ad unit"
3. Select "Banner"
4. Name: "Android Banner Ad"
5. Copy the Ad unit ID (starts with `ca-app-pub-`)

## 4. Update Your Code
Replace the test ad unit IDs in `src/components/ads/AdBanner.tsx`:

```typescript
// Replace these test IDs with your real ad unit IDs
const AD_UNIT_ID = Capacitor.getPlatform() === 'ios' 
  ? 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_IOS_BANNER_ID'      // Your iOS banner ad unit ID
  : 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_ANDROID_BANNER_ID'; // Your Android banner ad unit ID
```

Also set `isTesting: false` and `initializeForTesting: false` for production.

## 5. Add AdMob App ID to Capacitor Config
Update your `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  // ... existing config
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-YOUR_PUBLISHER_ID~YOUR_APP_ID', // Your AdMob App ID
      testingDevices: ['YOUR_TEST_DEVICE_ID'] // Optional: your test device ID
    },
    // ... other plugins
  }
};
```

## 6. Privacy & Compliance
- Update your privacy policy to mention ads
- Configure ad targeting settings in AdMob console
- Ensure GDPR/CCPA compliance if applicable

## 7. Revenue Optimization Tips
- Test different ad placements
- Monitor fill rates and eCPM
- Consider adding interstitial ads for higher revenue
- Use rewarded ads for premium features

## Current Status
✅ AdMob plugin installed  
✅ Banner ad component created  
✅ Test ads configured  
🔄 Replace with real ad unit IDs  
🔄 Add AdMob App ID to config  
🔄 Update privacy policy
