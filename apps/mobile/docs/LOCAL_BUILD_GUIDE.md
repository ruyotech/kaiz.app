# iOS Testing Guide (Without Apple Developer Account)

## Your Situation
- ✅ Personal Apple ID on iPhone
- ✅ Business Apple ID on MacBook (not enrolled in Developer Program)
- ❌ Apple Developer Account not enrolled ($99/year required for distribution)

## What You CAN Do Without Paid Developer Account
1. ✅ **Local Development Build** - Build and run directly on your iPhone via Xcode
2. ✅ **Test all features** including Camera, Face ID, etc.
3. ⚠️ **App expires in 7 days** - need to rebuild after expiration
4. ⚠️ **Limited to 3 apps** - free provisioning limits you to 3 apps per device

## What You CANNOT Do Without Paid Developer Account
- ❌ EAS Build for iOS (requires Apple Developer membership)
- ❌ TestFlight distribution
- ❌ App Store submission
- ❌ Ad-hoc distribution to others

---

## Step-by-Step: Local Build on iPhone

### Prerequisites
1. **Xcode installed** (from Mac App Store)
2. **iPhone connected** via USB cable
3. **Trust the computer** on your iPhone when prompted
4. **Apple ID signed in** to Xcode

### Step 1: Open Xcode and Sign In
1. Open **Xcode**
2. Go to **Xcode → Settings → Accounts** (or Cmd + ,)
3. Click **+** button at bottom left
4. Choose **Apple ID**
5. Sign in with your **Business Apple ID** (the one on your MacBook)

### Step 2: Connect Your iPhone
1. Connect iPhone to Mac via **USB cable**
2. On iPhone, tap **"Trust This Computer"** when prompted
3. Enter your iPhone passcode

### Step 3: Verify Device is Recognized
```bash
# List connected devices
xcrun xctrace list devices
```
You should see your iPhone listed.

### Step 4: Build and Run
```bash
cd /Users/ruyotech/Documents/GitHub/kaiz1-mobile-playground/apps/mobile

# Build and run on connected iPhone
npx expo run:ios --device
```

### Step 5: Handle Signing (First Time Only)
When Xcode opens during the build:
1. Click on the **KaizApp** project in the left sidebar
2. Select **KaizApp** under TARGETS
3. Go to **Signing & Capabilities** tab
4. Check **"Automatically manage signing"**
5. Select your **Team** (your Apple ID should appear)
6. If you see "Failed to register bundle identifier":
   - Change **Bundle Identifier** to something unique like `com.yourname.kaizapp`

### Step 6: Trust Developer on iPhone
After first install, you need to trust the developer:
1. On iPhone, go to **Settings → General → VPN & Device Management**
2. Find your Apple ID under "Developer App"
3. Tap on it and tap **"Trust"**
4. Tap **"Trust"** again to confirm

### Step 7: Run the App
The app should now launch on your iPhone! 🎉

---

## Quick Commands Reference

```bash
# Navigate to mobile app
cd /Users/ruyotech/Documents/GitHub/kaiz1-mobile-playground/apps/mobile

# Clean rebuild native projects
npx expo prebuild --clean

# Build and run on iPhone
npx expo run:ios --device

# If you have multiple devices, list them first
xcrun xctrace list devices

# Then specify device name
npx expo run:ios --device "Your iPhone Name"

# Start dev server (after initial build)
npx expo start --dev-client
```

---

## Troubleshooting

### "Could not find device" Error
```bash
# Make sure iPhone is connected and trusted
xcrun xctrace list devices

# Restart USB connection or try different cable
```

### Signing Errors
1. Open `ios/KaizApp.xcworkspace` in Xcode
2. Go to Signing & Capabilities
3. Make sure "Automatically manage signing" is checked
4. Select your Team
5. If bundle ID conflict, change it in Xcode

### "Untrusted Developer" on iPhone
1. Settings → General → VPN & Device Management
2. Tap your developer certificate
3. Tap "Trust"

### App Crashes on Launch
```bash
# View logs
npx react-native log-ios

# Or check Xcode console when running through Xcode
```

### Build Takes Forever
First build compiles all native code (~5-10 mins). Subsequent builds are faster.

### App Expired After 7 Days
Free provisioning apps expire. Simply rebuild:
```bash
npx expo run:ios --device
```

---

## Testing the New Features

### Test Face ID
1. Go to **Settings** tab in the app
2. Look for **Security** section
3. Toggle **Face ID Login** ON
4. Authenticate with Face ID when prompted
5. Log out
6. On login screen, tap **"Login with Face ID"** button

### Test Media Attachments
1. Go to **Command Center** tab
2. Tap on **AI Assistant** (chat)
3. Test each button:
   - 📷 Green camera button - take photo
   - 🖼️ Purple gallery button - select images
   - 📄 Amber file button - pick documents
   - 🎤 Red microphone button - record voice

---

## When You Get Apple Developer Account

Once you enroll in Apple Developer Program ($99/year):

### EAS Build Setup
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --profile development --platform ios
```

### Benefits of Developer Account
- ✅ No 7-day expiration
- ✅ TestFlight for beta testing
- ✅ EAS Build cloud builds
- ✅ Distribute to others
- ✅ App Store submission
- ✅ Push notifications setup

---

## Current Build Status

Your app has been prebuild with:
- ✅ Face ID permissions configured
- ✅ Camera permissions configured
- ✅ Microphone permissions configured
- ✅ Photo Library permissions configured
- ✅ expo-local-authentication plugin
- ✅ expo-dev-client installed

Ready to build and run!
