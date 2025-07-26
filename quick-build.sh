#!/bin/bash

# Quick build script for development
# This script provides faster builds for development purposes

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Quick Android debug build
build_android_quick() {
    print_status "Quick Android debug build..."
    cd android
    ./gradlew assembleDebug -x lint -x test
    cd ..
    print_success "Android debug APK ready!"
    print_status "Location: android/app/build/outputs/apk/debug/app-debug.apk"
}

# Quick iOS debug build
build_ios_quick() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo "iOS builds only supported on macOS"
        exit 1
    fi
    
    print_status "Quick iOS debug build..."
    npx react-native run-ios --configuration Debug
    print_success "iOS debug build completed!"
}

# Show usage
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]] || [[ $# -eq 0 ]]; then
    echo "Quick build script for development"
    echo ""
    echo "Usage: $0 [android|ios]"
    echo ""
    echo "  android   Quick Android debug build"
    echo "  ios       Quick iOS debug build"
    exit 0
fi

case $1 in
    "android")
        build_android_quick
        ;;
    "ios")
        build_ios_quick
        ;;
    *)
        echo "Invalid option. Use 'android' or 'ios'"
        exit 1
        ;;
esac
