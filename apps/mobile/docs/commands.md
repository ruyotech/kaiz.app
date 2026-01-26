# Development Commands Reference

Quick reference for building, testing, and troubleshooting the Kaiz LifeOS mobile app.

---

## Package Installation

### Install All Required Packages
```bash
cd apps/mobile

# Install all dependencies at once
npx expo install expo-dev-client expo-image-picker expo-document-picker expo-av expo-audio expo-local-authentication expo-file-system @react-native-async-storage/async-storage
```

### Individual Package Installation
```bash
# Development client (required for native features)
npx expo install expo-dev-client

# Media attachments
npx expo install expo-image-picker expo-document-picker expo-av expo-audio expo-file-system

# Biometric authentication
npx expo install expo-local-authentication

# Persistent storage
npx expo install @react-native-async-storage/async-storage
```

---

## Local Development Build

### Prerequisites
- Xcode installed (for iOS)
- Physical iPhone connected (for camera/Face ID testing)
- iOS development signing configured

### Build & Run (Local - No Apple Developer Account)
```bash
cd apps/mobile

# 1. Clean and regenerate native projects
npx expo prebuild --clean

# 2. Build and run on connected iPhone
npx expo run:ios --device

# Or specify device by name
npx expo run:ios --device "John's iPhone"

# List available devices
xcrun xctrace list devices
```

> ⚠️ **Note**: Local builds expire after 7 days and need to be rebuilt. This is a limitation when not using an Apple Developer account.

### Start Development Server (After Build)
```bash
# Start Metro bundler with dev client
npx expo start --dev-client

# Or with cache clearing
npx expo start --dev-client --clear
```

---

## EAS Build (Apple Developer Account Required)

### Setup EAS
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to Expo account
eas login

# Configure project
eas build:configure
```

### Development Build (Ad-hoc Distribution)
```bash
# iOS development build
eas build --profile development --platform ios

# Android development build  
eas build --profile development --platform android

# Both platforms
eas build --profile development --platform all
```

### Production Build
```bash
# iOS production (App Store)
eas build --profile production --platform ios

# Android production (Play Store)
eas build --profile production --platform android
```

### Submit to App Store
```bash
eas submit --platform ios
eas submit --platform android
```

---

## Troubleshooting Commands

### Clear All Caches
```bash
cd apps/mobile

# Full nuke (from package.json script)
npm run nuke

# Or manually:
rm -rf ios android node_modules/.cache
rm -rf ~/Library/Developer/Xcode/DerivedData/KaizApp-*
npm install
npx expo prebuild --clean
```

### Clear Metro Cache Only
```bash
npx expo start --clear
```

### Reset Watchman
```bash
watchman watch-del-all
```

### Clear CocoaPods Cache (iOS)
```bash
cd ios
pod cache clean --all
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Clear Gradle Cache (Android)
```bash
cd android
./gradlew clean
cd ..
```

### Reinstall Node Modules
```bash
rm -rf node_modules
rm package-lock.json  # or yarn.lock
npm install
```

---

## Testing Checklist

### Physical Device Testing ✅
Required for:
- [ ] Camera capture
- [ ] Face ID / Touch ID
- [ ] Voice recording with microphone
- [ ] Push notifications
- [ ] Full gallery access
- [ ] Document picker with iCloud

### Simulator Testing ⚠️
Limited functionality:
- [ ] UI/UX testing
- [ ] Navigation flows
- [ ] Form validation
- [ ] API integration
- [ ] State management

### Face ID Testing Checklist
1. [ ] Build development client on physical iPhone with Face ID
2. [ ] Log in with email/password
3. [ ] Go to Settings > Security
4. [ ] Verify Face ID toggle appears
5. [ ] Toggle ON → Face ID prompt appears
6. [ ] Authenticate → See success message
7. [ ] Log out
8. [ ] On login screen, see "Login with Face ID" button
9. [ ] Tap button → Face ID prompt
10. [ ] Authenticate → Logged in automatically

### Media Attachments Testing Checklist
1. [ ] Build development client on physical device
2. [ ] Go to Command Center > AI Assistant
3. [ ] Test Camera:
   - [ ] Grant permission
   - [ ] Take photo
   - [ ] See preview
   - [ ] Remove attachment (X button)
4. [ ] Test Gallery:
   - [ ] Grant permission  
   - [ ] Select single image
   - [ ] Select multiple images
   - [ ] Verify limit (max 5)
5. [ ] Test File Picker:
   - [ ] Select document
   - [ ] Verify file info shows
6. [ ] Test Voice Recording:
   - [ ] Grant microphone permission
   - [ ] Record (see animation)
   - [ ] Cancel recording
   - [ ] Accept recording
   - [ ] Play preview
7. [ ] Send message with attachments

---

## Useful Expo Commands

### Project Info
```bash
# Check Expo SDK version
npx expo config --type introspect | grep -A2 "expo"

# List installed Expo packages
npx expo install --check

# Doctor - check for issues
npx expo-doctor
```

### Device Management
```bash
# List connected iOS devices
xcrun xctrace list devices

# List connected Android devices
adb devices

# Open iOS Simulator
open -a Simulator
```

### Logs
```bash
# View Metro logs
npx expo start --dev-client

# View device logs (iOS)
npx react-native log-ios

# View device logs (Android)
npx react-native log-android
adb logcat
```

---

## Environment Variables

Create `.env` file in `apps/mobile/`:
```bash
# API Configuration
API_URL=https://api.kaizlifeos.com
API_URL_DEV=http://localhost:8080

# Feature Flags
ENABLE_DEMO_MODE=true
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run start` | Start Expo dev server |
| `npm run prebuild` | Regenerate native projects |
| `npm run fresh` | Clean rebuild |
| `npm run nuke` | Full clean + rebuild |
| `npm run clean` | Clean build artifacts |
| `npx expo run:ios --device` | Build & run on iPhone |
| `npx expo start --dev-client` | Start with dev client |
| `eas build --profile development --platform ios` | EAS development build |

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [expo-document-picker](https://docs.expo.dev/versions/latest/sdk/document-picker/)
- [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/)
