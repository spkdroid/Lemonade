# GitHub Actions Setup for React Native Lemonade App

This repository uses GitHub Actions for Continuous Integration and Deployment (CI/CD). The workflows automatically run tests and build release APKs when code is pushed to the repository.

## Workflow Files

### 1. `ci-cd.yml` - Main CI/CD Pipeline
- **Triggers**: Push to master/main/develop branches, Pull requests, Manual dispatch
- **Jobs**:
  - **Test**: Runs linting, unit tests, and generates coverage reports
  - **Build Android APK**: Creates a release APK file
  - **Build Android Bundle**: Creates an AAB file for Play Store deployment (only on master/main)

## Required GitHub Secrets

To build signed release APKs, you need to configure the following secrets in your GitHub repository:

### Setting up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of the following:

#### Required Secrets:

| Secret Name | Description | How to Generate |
|-------------|-------------|-----------------|
| `RELEASE_KEYSTORE` | Base64 encoded keystore file | `base64 -i your-release-key.keystore` |
| `RELEASE_KEY_ALIAS` | Keystore alias name | The alias you used when creating the keystore |
| `RELEASE_STORE_PASSWORD` | Keystore password | Password for the keystore file |
| `RELEASE_KEY_PASSWORD` | Key password | Password for the specific key |

### Generating a Release Keystore

If you don't have a release keystore yet, create one:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Then encode it to base64:

```bash
# On Linux/macOS
base64 -i my-upload-key.keystore

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("my-upload-key.keystore"))
```

## Workflow Outputs

### Artifacts
- **Release APK**: Available for download from the Actions tab for 30 days
- **Release Bundle (AAB)**: For Play Store uploads (only on master/main branches)
- **Test Coverage**: Uploaded to Codecov

### Releases
- Automatic GitHub releases are created when pushing to master/main branch
- Release includes the APK file and commit information
- Tagged with version number based on GitHub run number

## Local Development

### Running Tests
```bash
npm test                # Run tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

### Building Locally
```bash
# Android Debug APK
cd android && ./gradlew assembleDebug

# Android Release APK (requires keystore setup)
cd android && ./gradlew assembleRelease

# Android Bundle for Play Store
cd android && ./gradlew bundleRelease
```

## Troubleshooting

### Common Issues

1. **Keystore Issues**
   - Ensure the keystore is properly base64 encoded
   - Verify all passwords and alias names are correct
   - Check that the keystore file exists in your repository (if using a committed keystore)

2. **Gradle Build Failures**
   - Clear Gradle cache: `./gradlew clean`
   - Check Java version compatibility (requires Java 17)
   - Verify Android SDK components are installed

3. **Test Failures**
   - Run tests locally first: `npm test`
   - Check for missing dependencies: `npm install`
   - Verify Jest configuration is correct

### Viewing Build Logs
1. Go to the **Actions** tab in your GitHub repository
2. Click on the workflow run you want to inspect
3. Expand the job and step you want to examine
4. Review the logs for any error messages

## Customization

### Modifying Build Triggers
Edit the `on:` section in `.github/workflows/ci-cd.yml`:

```yaml
on:
  push:
    branches: [ master, main, develop, feature/* ]  # Add more branches
  pull_request:
    branches: [ master, main ]
  schedule:
    - cron: '0 2 * * 1'  # Run every Monday at 2 AM
```

### Adding iOS Builds
To add iOS builds, you'll need macOS runners and additional configuration for code signing and provisioning profiles.

### Custom Build Scripts
If you have custom build scripts (like `build.sh`), you can use them in the workflow:

```yaml
- name: Run custom build script
  run: |
    chmod +x build.sh
    ./build.sh android release
```

## Security Notes

- Never commit keystore files or passwords to your repository
- Use GitHub Secrets for all sensitive information
- Regularly rotate keystore passwords
- Consider using separate keystores for different environments

## Support

For issues with the CI/CD pipeline:
1. Check the GitHub Actions logs
2. Verify all secrets are properly configured
3. Ensure your local build works before pushing
4. Review the React Native and Android build documentation
