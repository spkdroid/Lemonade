#!/bin/bash

# React Native Debug APK Builder
# This script builds a debug APK for testing

echo "🚀 Building Debug APK for Lemonade Stand App..."

# Navigate to project root
cd "$(dirname "$0")"

# Clean previous builds
echo "📁 Cleaning previous builds..."
rm -rf android/app/build/outputs/apk/

# Build the bundle first
echo "📦 Creating React Native bundle..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

# Create assets directory if it doesn't exist
mkdir -p android/app/src/main/assets/

# Build debug APK
echo "🔨 Building Debug APK..."
cd android

# Try alternative build command
./gradlew clean
./gradlew :app:assembleDebug --warning-mode all

# Check if APK was created
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ Success! APK created at:"
    echo "📱 $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
    
    # Copy to easy access location
    cp app/build/outputs/apk/debug/app-debug.apk ../LemonadeStandApp-debug.apk
    echo "📱 Also copied to: $(dirname "$(pwd)")/LemonadeStandApp-debug.apk"
else
    echo "❌ APK build failed"
    exit 1
fi

echo "🎉 Debug APK ready for testing!"
echo "📲 You can now install this APK on any Android device"
