#!/bin/bash

# Build script for Lemonade Stand App Release APK
# This script builds a standalone APK for testing on other devices

echo "🍋 Building Lemonade Stand App Release APK..."

# Set environment variables
export JAVA_HOME=/usr/local/Cellar/openjdk@17/17.0.16/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/Users/ram/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Navigate to project directory
cd "$(dirname "$0")"

echo "📦 Creating React Native bundle..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

echo "🔧 Building APK..."
cd android

# Clean previous builds
./gradlew clean

# Build release APK
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo "✅ APK built successfully!"
    echo "📱 Your APK is located at:"
    echo "   android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo "🚀 You can now install this APK on any Android device for testing!"
    echo ""
    echo "To install via ADB:"
    echo "   adb install android/app/build/outputs/apk/release/app-release.apk"
else
    echo "❌ Build failed!"
    echo "💡 Alternative: You can use the debug APK for testing:"
    echo "   ./gradlew assembleDebug"
    echo "   The debug APK will be at: android/app/build/outputs/apk/debug/app-debug.apk"
fi
