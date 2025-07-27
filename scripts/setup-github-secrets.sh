#!/bin/bash

# Helper script to generate GitHub secrets for Android keystore
# Run this script to get the base64 encoded keystore for GitHub secrets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
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

echo "================================================"
echo "  GitHub Secrets Setup for Android Keystore"
echo "================================================"
echo

# Check if keystore file exists
KEYSTORE_FILE=""
if [ -f "your-release-key.keystore" ]; then
    KEYSTORE_FILE="your-release-key.keystore"
    print_info "Found keystore file: $KEYSTORE_FILE"
elif [ -f "android/app/your-release-key.keystore" ]; then
    KEYSTORE_FILE="android/app/your-release-key.keystore"
    print_info "Found keystore file: $KEYSTORE_FILE"
else
    print_warning "No keystore file found. Looking for *.keystore files..."
    KEYSTORE_FILES=$(find . -name "*.keystore" -type f 2>/dev/null | head -5)
    
    if [ -z "$KEYSTORE_FILES" ]; then
        print_error "No keystore files found!"
        echo
        print_info "To create a new keystore, run:"
        echo "keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000"
        exit 1
    else
        echo "Found keystore files:"
        echo "$KEYSTORE_FILES"
        echo
        read -p "Enter the path to your keystore file: " KEYSTORE_FILE
        
        if [ ! -f "$KEYSTORE_FILE" ]; then
            print_error "File not found: $KEYSTORE_FILE"
            exit 1
        fi
    fi
fi

echo
print_info "Using keystore file: $KEYSTORE_FILE"

# Get keystore information
echo
print_info "Please provide the following information for your keystore:"
read -p "Enter the keystore alias: " KEY_ALIAS
read -s -p "Enter the keystore password: " STORE_PASSWORD
echo
read -s -p "Enter the key password: " KEY_PASSWORD
echo

# Validate keystore
print_info "Validating keystore..."
if keytool -list -keystore "$KEYSTORE_FILE" -alias "$KEY_ALIAS" -storepass "$STORE_PASSWORD" > /dev/null 2>&1; then
    print_success "Keystore validation successful!"
else
    print_error "Keystore validation failed. Please check your credentials."
    exit 1
fi

# Generate base64 encoded keystore
print_info "Generating base64 encoded keystore..."
ENCODED_KEYSTORE=$(base64 -i "$KEYSTORE_FILE" | tr -d '\n')

echo
echo "================================================"
print_success "GitHub Secrets Configuration"
echo "================================================"
echo
echo "Add the following secrets to your GitHub repository:"
echo "(Go to Settings → Secrets and variables → Actions)"
echo
echo "Secret Name: RELEASE_KEYSTORE"
echo "Secret Value:"
echo "$ENCODED_KEYSTORE"
echo
echo "Secret Name: RELEASE_KEY_ALIAS"
echo "Secret Value: $KEY_ALIAS"
echo
echo "Secret Name: RELEASE_STORE_PASSWORD"
echo "Secret Value: $STORE_PASSWORD"
echo
echo "Secret Name: RELEASE_KEY_PASSWORD"
echo "Secret Value: $KEY_PASSWORD"
echo
echo "================================================"
print_warning "SECURITY REMINDER:"
echo "- Keep these values secure and never commit them to your repository"
echo "- Use different keystores for different environments if needed"
echo "- Consider rotating passwords regularly"
echo "================================================"
echo

# Save to file option
read -p "Save secrets to file? (y/N): " SAVE_TO_FILE
if [[ $SAVE_TO_FILE =~ ^[Yy]$ ]]; then
    SECRETS_FILE="github-secrets-$(date +%Y%m%d-%H%M%S).txt"
    cat > "$SECRETS_FILE" << EOF
GitHub Secrets for Android Keystore
Generated on: $(date)
Keystore file: $KEYSTORE_FILE

RELEASE_KEYSTORE:
$ENCODED_KEYSTORE

RELEASE_KEY_ALIAS:
$KEY_ALIAS

RELEASE_STORE_PASSWORD:
$STORE_PASSWORD

RELEASE_KEY_PASSWORD:
$KEY_PASSWORD

SECURITY WARNING: Delete this file after adding secrets to GitHub!
EOF
    print_success "Secrets saved to: $SECRETS_FILE"
    print_warning "Remember to delete this file after configuring GitHub secrets!"
fi

echo
print_success "Setup complete! You can now use the GitHub Actions workflows."
print_info "Don't forget to commit and push the workflow files to your repository."
