# Kaiz 

Personal SDLC Super-App monorepo with mobile app and Spring Boot backend.

## 📂 Project Structure

```
kaiz1-mobile-playground/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── backend/         # Spring Boot API server
└── README.md
```

## ⚠️ Prerequisites

- **Node.js 18+** for the mobile app
- **Java 21+** for the backend
- **Docker** for running the backend with PostgreSQL

## 🚀 Quick Start

### Backend (Spring Boot API)

```bash
cd apps/backend
docker compose up -d
```

This starts:
- PostgreSQL database on port 5433
- Spring Boot API on port 8080

API Documentation: http://localhost:8080/swagger-ui.html

### Mobile App (Expo)

```bash
cd apps/mobile
npm install
npx expo start --clear
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `s` to switch between Expo Go and development build
- Scan QR code with Expo Go app on your phone

## 📂 Mobile App Structure

```
apps/mobile/
├── app/           # Expo Router screens
├── components/    # Reusable UI components
├── data/mock/     # Dummy JSON data (for demo mode)
├── services/      # API layer (real + mock)
├── store/         # Zustand state management
├── types/         # TypeScript definitions
└── utils/         # Helper functions
```

## 📂 Backend Structure

```
apps/backend/
├── src/main/java/com/kaiz//
│   ├── identity/      # Auth & user management
│   ├── lifewheel/     # Life wheel areas
│   └── shared/        # Common utilities
└── src/main/resources/
    └── db/migration/  # Flyway migrations
```

## 🎯 Features

- ✅ SDLC Task Management with Story Points
- ✅ Motivational Quotes
- ✅ Book Summaries
- ✅ Group Challenges with Leaderboards
- ✅ Pomodoro Focus Timer
- ✅ AI Scrum Master Notifications
- ✅ Family Account Management

## 🚧 Features Removed for Launch Phase

The following features have been temporarily removed to focus on core functionality for the initial launch. They will be added back in post-launch iterations:

### 📊 Reports & Analytics
A comprehensive analytics dashboard that provides:
- Task completion metrics and velocity tracking
- Sprint performance visualization
- Focus time analytics from Pomodoro sessions
- Challenge completion statistics
- Cross-feature performance reports

**Why Removed:** The reports feature requires significant backend infrastructure for data aggregation and visualization. To ensure a stable launch, we're focusing on core task management and challenge features first. Analytics will be gradually introduced as we collect sufficient user data.

### 💰 Bills Management
A bill tracking system with features including:
- Bill tracking with payment status (paid, unpaid, overdue)
- OCR scanning for automatic bill data extraction
- Recurring bill management
- Payment reminders and notifications
- Category-based organization
- Financial analytics and spending insights

**Why Removed:** The bills feature involves financial data management, payment integrations, and OCR processing that require additional security considerations and third-party service integrations. We're deferring this to ensure proper security measures and compliance are in place before handling financial information.
