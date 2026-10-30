const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const firebaseAuthRnEntry = path.resolve(
  __dirname,
  'node_modules/@firebase/auth/dist/rn/index.js',
);

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'firebase/auth' && platform !== 'web') {
    return {
      filePath: firebaseAuthRnEntry,
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
