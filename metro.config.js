const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  watchFolders: [],
  resolver: {
    blockList: [
      // Exclude CMake temporary files
      /.*\.cxx\/.*/,
      /.*CMakeFiles\/.*/,
      /.*CMakeTmp\/.*/,
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);