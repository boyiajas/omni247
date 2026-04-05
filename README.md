# Omni247 - React Native App

Global Incident Reporting Application built with React Native CLI.

## Prerequisites

- Node.js >= 20
- React Native CLI
- Android SDK for Android development
- Xcode for iOS development
- CocoaPods for iOS dependencies

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install iOS dependencies (Mac only):
```bash
cd ios && pod install && cd ..
```

3. Configure environment variables:
```bash
cp .env.example .env
# Update with your API keys and endpoints
```

## Running the App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## Development

### Start Metro Bundler
```bash
npm start
```

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Features

- 📍 GPS-based incident reporting
- 🗺️ Interactive world map with categorized markers
- 📸 Multimedia support (photos, videos, audio)
- 🔔 Push notifications for nearby incidents
- 🔒 Privacy modes (public, anonymous)
- 🏆 Rewards and achievements system
- 🏢 Agency dashboards
- 🤖 AI moderation pipeline integration

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/       # API and service layers
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── utils/          # Utility functions
├── theme/          # Theme configuration
├── config/         # App configuration
└── assets/         # Images, fonts, sounds
```

## Configuration

Update the following files with your configuration:

- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `android/app/google-services.json` - Firebase config for Android
- `ios/GoogleService-Info.plist` - Firebase config for iOS

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is proprietary software.
