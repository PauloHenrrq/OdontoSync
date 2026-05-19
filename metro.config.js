const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Resolve Zustand using CommonJS to bypass import.meta errors on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};
 
module.exports = withNativeWind(config, { input: './global.css' });