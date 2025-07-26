#!/bin/bash

# Build script for React Native Lemonade App
# Supports building for both Android and iOS platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to find and change to project root
find_project_root() {
    # Look for package.json to identify project root
    local current_dir="$(pwd)"
    local search_dir="$current_dir"
    
    while [ "$search_dir" != "/" ]; do
        if [ -f "$search_dir/package.json" ] && [ -f "$search_dir/App.js" ]; then
            cd "$search_dir"
            print_status "Found project root: $search_dir"
            return 0
        fi
        search_dir="$(dirname "$search_dir")"
    done
    
    print_error "Could not find React Native project root (looking for package.json and App.js)"
    exit 1
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [android|ios|both] [debug|release]"
    echo ""
    echo "Platforms:"
    echo "  android   Build for Android"
    echo "  ios       Build for iOS"
    echo "  both      Build for both platforms"
    echo ""
    echo "Build types:"
    echo "  debug     Build debug version (default)"
    echo "  release   Build release version"
    echo ""
    echo "Examples:"
    echo "  $0 android debug"
    echo "  $0 ios release"
    echo "  $0 both debug"
    echo "  $0 android        # defaults to debug"
}

# Function to setup Android environment
setup_android_env() {
    print_status "Setting up Android environment..."
    
    # Check for common Android SDK locations on macOS
    ANDROID_SDK_LOCATIONS=(
        "$HOME/Library/Android/sdk"
        "$HOME/Android/Sdk"
        "/opt/android-sdk"
        "/usr/local/android-sdk"
    )
    
    # Try to find Android SDK
    for location in "${ANDROID_SDK_LOCATIONS[@]}"; do
        if [ -d "$location" ]; then
            export ANDROID_HOME="$location"
            export ANDROID_SDK_ROOT="$location"
            export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$PATH"
            print_success "Found Android SDK at: $ANDROID_HOME"
            return 0
        fi
    done
    
    # If not found, try Android Studio's default location
    if [ -d "/Applications/Android Studio.app" ]; then
        ANDROID_STUDIO_SDK="$HOME/Library/Android/sdk"
        if [ -d "$ANDROID_STUDIO_SDK" ]; then
            export ANDROID_HOME="$ANDROID_STUDIO_SDK"
            export ANDROID_SDK_ROOT="$ANDROID_STUDIO_SDK"
            export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$PATH"
            print_success "Using Android Studio SDK at: $ANDROID_HOME"
            return 0
        fi
    fi
    
    print_error "Android SDK not found!"
    print_status "Please install Android Studio or set ANDROID_HOME manually:"
    print_status "  export ANDROID_HOME=/path/to/your/android/sdk"
    print_status "  export PATH=\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/tools:\$PATH"
    print_status ""
    print_status "To install Android Studio, visit: https://developer.android.com/studio"
    return 1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check React Native CLI
    if ! command -v npx &> /dev/null; then
        print_error "npx is not available"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Ensure we're in project root
    find_project_root
    
    npm install
    
    if [[ "$OSTYPE" == "darwin"* ]] && [ -d "ios" ]; then
        print_status "Installing iOS dependencies..."
        cd ios && pod install && cd ..
    fi
    
    print_success "Dependencies installed"
}

# Function to clean build artifacts
clean_build() {
    print_status "Cleaning build artifacts..."
    
    # Clean React Native cache
    npx react-native start --reset-cache &
    METRO_PID=$!
    sleep 3
    kill $METRO_PID 2>/dev/null || true
    
    # Clean Android build
    if [ -d "android" ]; then
        print_status "Cleaning Android build..."
        cd android
        ./gradlew clean || print_warning "Failed to clean Android build"
        cd ..
    fi
    
    # Clean iOS build
    if [[ "$OSTYPE" == "darwin"* ]] && [ -d "ios" ]; then
        print_status "Cleaning iOS build..."
        cd ios
        xcodebuild clean -workspace LemonadeStandApp.xcworkspace -scheme LemonadeStandApp 2>/dev/null || print_warning "Failed to clean iOS build"
        cd ..
    fi
    
    print_success "Build artifacts cleaned"
}

# Function to build Android
build_android() {
    local build_type=$1
    
    print_status "Building Android ($build_type)..."
    
    # Setup Android environment if not already set
    if [ -z "$ANDROID_HOME" ]; then
        if ! setup_android_env; then
            print_error "Cannot build Android without Android SDK"
            exit 1
        fi
    fi
    
    # Check for adb
    if ! command -v adb &> /dev/null; then
        print_error "adb not found. Please ensure Android SDK is properly installed."
        exit 1
    fi
    
    # Ensure we're in project root and android directory exists
    find_project_root
    if [ ! -d "android" ]; then
        print_error "Android directory not found. Please ensure you're in a React Native project root."
        exit 1
    fi
    
    cd android
    
    if [ "$build_type" = "release" ]; then
        print_status "Building Android Release APK..."
        ./gradlew assembleRelease
        
        if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
            print_success "Android Release APK built successfully!"
            print_status "APK location: android/app/build/outputs/apk/release/app-release.apk"
        else
            print_error "Failed to build Android Release APK"
            exit 1
        fi
    else
        print_status "Building Android Debug APK..."
        ./gradlew assembleDebug
        
        if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
            print_success "Android Debug APK built successfully!"
            print_status "APK location: android/app/build/outputs/apk/debug/app-debug.apk"
        else
            print_error "Failed to build Android Debug APK"
            exit 1
        fi
    fi
    
    cd ..
}

# Function to build iOS
build_ios() {
    local build_type=$1
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "iOS builds are only supported on macOS"
        exit 1
    fi
    
    print_status "Building iOS ($build_type)..."
    
    # Check Xcode
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is not installed"
        exit 1
    fi
    
    # Ensure we're in project root and ios directory exists
    find_project_root
    if [ ! -d "ios" ]; then
        print_error "iOS directory not found. Please ensure you're in a React Native project root."
        exit 1
    fi
    
    cd ios
    
    if [ "$build_type" = "release" ]; then
        print_status "Building iOS Release..."
        xcodebuild -workspace LemonadeStandApp.xcworkspace \
                   -scheme LemonadeStandApp \
                   -configuration Release \
                   -destination generic/platform=iOS \
                   archive -archivePath build/LemonadeStandApp.xcarchive
        
        if [ -d "build/LemonadeStandApp.xcarchive" ]; then
            print_success "iOS Release archive built successfully!"
            print_status "Archive location: ios/build/LemonadeStandApp.xcarchive"
        else
            print_error "Failed to build iOS Release archive"
            exit 1
        fi
    else
        print_status "Building iOS Debug..."
        xcodebuild -workspace LemonadeStandApp.xcworkspace \
                   -scheme LemonadeStandApp \
                   -configuration Debug \
                   -destination generic/platform=iOS \
                   build
        
        print_success "iOS Debug build completed successfully!"
    fi
    
    cd ..
}

# Main script logic
main() {
    local platform=${1:-"android"}
    local build_type=${2:-"debug"}
    
    # Validate arguments
    if [[ ! "$platform" =~ ^(android|ios|both)$ ]]; then
        print_error "Invalid platform: $platform"
        show_usage
        exit 1
    fi
    
    if [[ ! "$build_type" =~ ^(debug|release)$ ]]; then
        print_error "Invalid build type: $build_type"
        show_usage
        exit 1
    fi
    
    print_status "Starting build process..."
    print_status "Platform: $platform"
    print_status "Build type: $build_type"
    echo ""
    
    # Run build steps
    check_prerequisites
    install_dependencies
    clean_build
    
    # Build based on platform
    case $platform in
        "android")
            build_android $build_type
            ;;
        "ios")
            build_ios $build_type
            ;;
        "both")
            build_android $build_type
            build_ios $build_type
            ;;
    esac
    
    print_success "Build process completed successfully!"
}

# Check if help is requested
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    show_usage
    exit 0
fi

# Run main function with all arguments
main "$@"
