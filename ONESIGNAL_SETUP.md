# OneSignal Push Notifications Setup

This app is configured to send push notifications via OneSignal. Follow these steps to complete the setup:

## What's Already Done

✅ Database table created for storing device tokens (`user_push_tokens`)  
✅ OneSignal SDK installed (`onesignal-cordova-plugin`)  
✅ Push notification hook created (`usePushNotifications`)  
✅ Edge function updated to send push notifications  
✅ OneSignal secrets added to Supabase (ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY)

## What You Need to Do

### 1. Update .env File

Replace `YOUR_ONESIGNAL_APP_ID` in your `.env` file with your actual OneSignal App ID:

```
VITE_ONESIGNAL_APP_ID="your-actual-app-id-here"
```

You can find this in your OneSignal dashboard under **Settings > Keys & IDs**.

### 2. Test on Your Local Machine

Since you set up OneSignal via Natively, you'll need to:

1. **Export to GitHub** (if not already done)
2. **Clone the repository** to your local machine
3. Run `npm install` to install dependencies
4. Run `npx cap sync` to sync the OneSignal plugin to native projects
5. Build and run on a physical device or emulator:
   - iOS: `npx cap run ios` (requires Mac with Xcode)
   - Android: `npx cap run android` (requires Android Studio)

### 3. Configure Native Projects (via Natively or manually)

Since you're using Natively for builds, make sure OneSignal is properly configured in your native projects:

#### For iOS (via Xcode or Natively):
- Add Push Notification capability
- Configure APNs certificates in OneSignal dashboard

#### For Android (via Android Studio or Natively):
- Ensure FCM (Firebase Cloud Messaging) is configured
- Add `google-services.json` file (if using FCM)

### 4. Test Push Notifications

1. Open the app on a physical device
2. Grant notification permissions when prompted
3. The app will automatically register the device with OneSignal
4. Device token (player ID) will be saved to Supabase database
5. At 8 PM local time, if you have incomplete challenges, you'll receive a push notification

### 5. Verify Setup

You can verify the setup is working by:

1. Checking the Supabase database table `user_push_tokens` for saved tokens
2. Sending a test notification from OneSignal dashboard
3. Checking edge function logs for any errors

## How It Works

1. **Registration**: When a user opens the app on a mobile device, the `usePushNotifications` hook initializes OneSignal and requests notification permissions
2. **Token Storage**: Once permission is granted, the device's OneSignal Player ID is stored in the `user_push_tokens` table
3. **Scheduled Reminders**: The `send-challenge-reminders` edge function runs every 30 minutes
4. **Push Delivery**: When a user has incomplete challenges at 8 PM local time, the function sends a push notification via OneSignal REST API
5. **In-App Notifications**: A record is also created in `scheduled_notifications` for in-app display

## Troubleshooting

- **Not receiving notifications**: Check edge function logs in Supabase
- **Token not saving**: Check browser/app console for errors
- **Wrong timezone**: User's timezone is stored in the `profiles` table
- **OneSignal API errors**: Verify your REST API Key is correct in Supabase secrets

## Important Notes

- Push notifications only work on **native mobile apps** (iOS/Android), not in the browser
- Users must grant notification permissions for push to work
- The edge function uses the OneSignal REST API to send notifications
- OneSignal App ID is public (stored in .env), REST API Key is secret (stored in Supabase)
