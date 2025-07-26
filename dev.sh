#!/bin/bash

# Quick development build script for React Native Lemonade App
# This script is optimized for fast development builds

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to find and change to project root
find_project_root() {
    # Look for package.json to identify project root
    local current_dir="$(pwd)"
    local search_dir="$current_dir"
    
    while [ "$search_dir" != "/" ]; do
        if [ -f "$search_dir/package.json" ] && [ -f "$search_dir/App.js" ]; then
            cd "$search_dir"
            print_info "Found project root: $search_dir"
            return 0
        fi
        search_dir="$(dirname "$search_dir")"
    done
    
    print_info "Could not find React Native project root (looking for package.json and App.js)"
    exit 1
}

# Setup Android environment if needed
setup_android() {
    if [ -z "$ANDROID_HOME" ]; then
        if [ -d "$HOME/Library/Android/sdk" ]; then
            export ANDROID_HOME="$HOME/Library/Android/sdk"
            export PATH="$ANDROID_HOME/platform-tools:$PATH"
            print_success "Android SDK found at $ANDROID_HOME"
        else
            print_info "Android SDK not found. Using build.sh for full setup."
            exit 1
        fi
    fi
}

case "$1" in
    "android")
        print_info "Quick Android Debug Build"
        find_project_root
        setup_android
        if [ ! -d "android" ]; then
            print_info "Android directory not found. Please ensure you're in a React Native project root."
            exit 1
        fi
        cd android && ./gradlew assembleDebug && cd ..
        print_success "Android debug APK ready!"
        ;;
    "ios")
        print_info "Quick iOS Debug Build"
        find_project_root
        npx react-native run-ios --configuration Debug
        print_success "iOS debug build completed!"
        ;;
    "metro")
        print_info "Starting Metro bundler..."
        find_project_root
        npx react-native start
        ;;
    *)
        echo "Usage: $0 [android|ios|metro]"
        echo ""
        echo "Quick commands:"
        echo "  android  - Build debug Android APK"
        echo "  ios      - Build debug iOS app"
        echo "  metro    - Start Metro bundler"
        echo ""
        echo "For full builds with more options, use: ./build.sh"
        ;;
esac
