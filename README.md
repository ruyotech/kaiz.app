# Kaiz1 Mobile Playground

Personal SDLC Super-App mobile playground built with Expo and TypeScript.

## ⚠️ Setup Required

**This project requires Node.js 18+ to run.** Since Node.js is not currently installed on your system, you'll need to install it before running the app.

### Install Node.js

Choose one of these methods:

1. **Homebrew** (requires password):
   ```bash
   brew install node
   ```

2. **Official Installer**: Download from [nodejs.org](https://nodejs.org/)

3. **NVM (Node Version Manager)**:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   ```

## 📦 Installation

Once Node.js is installed:

```bash
npm install
```

## 🚀 Running the App

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 📂 Project Structure

- `app/` - Expo Router screens
- `components/` - Reusable UI components
- `data/mock/` - Dummy JSON data files
- `services/` - Mock API layer
- `store/` - Zustand state management
- `types/` - TypeScript definitions
- `utils/` - Helper functions

## 🎯 Features

- ✅ SDLC Task Management with Story Points
- ✅ Bill Tracking with OCR Drafts
- ✅ Motivational Quotes
- ✅ Book Summaries
- ✅ Group Challenges with Leaderboards
- ✅ AI Scrum Master Notifications
- ✅ Family Account Management
