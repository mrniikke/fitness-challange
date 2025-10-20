# AdMob Setup Instructions

Your app is now configured with AdMob banner ads!

## Configuration Details

- **Publisher ID**: pub-5029794477992220
- **iOS Banner Ad Unit ID**: ca-app-pub-5029794477992220/2828872802
- **Android Banner Ad Unit ID**: ca-app-pub-5029794477992220/4638849745

## Important: app-ads.txt File

The `public/app-ads.txt` file has been created with your publisher ID. This file is required by AdMob to verify ad inventory and prevent ad fraud.

**Content of app-ads.txt:**
```
google.com, pub-5029794477992220, DIRECT, f08c47fec0942fa0
```

This file will automatically be published at the root of your website when you deploy (e.g., `https://yourdomain.com/app-ads.txt`).

## Next Steps

1. **Export and Setup Native Project**:
   - Export your project to GitHub
   - Pull the project locally
   - Run `npm install`
   - Add platforms: `npx cap add ios` and/or `npx cap add android`
   - Run `npx cap sync`

2. **Configure AdMob in Your AdMob Dashboard**:
   - Go to https://admob.google.com
   - Add your app (iOS and/or Android)
   - Make sure your ad units are properly configured
   - Wait for ads to be approved (can take a few hours)

3. **Testing Ads**:
   - During development, you can enable test ads by changing `isTesting: true` in the AdBanner component
   - For production, make sure `isTesting: false`

4. **Build and Run**:
   - Build: `npm run build`
   - Sync: `npx cap sync`
   - Run: `npx cap run ios` or `npx cap run android`

## Ad Placement

Banner ads are currently placed at the bottom of:
- Group list view
- Group detail view

You can customize the position by modifying the `position` prop in the AdBanner component (`'top'` or `'bottom'`).

## Troubleshooting

- Check the console logs for AdMob initialization and ad loading messages
- Make sure your AdMob account is properly set up and ads are approved
- Verify that your app-ads.txt file is accessible at your domain root
- For iOS, you may need to configure App Tracking Transparency in your Info.plist

## Important Notes

- Ads will only show on native platforms (iOS/Android), not in the web preview
- The app-ads.txt file helps prevent ad fraud and is required by Google AdMob
- It can take a few hours for new ad units to start serving ads
