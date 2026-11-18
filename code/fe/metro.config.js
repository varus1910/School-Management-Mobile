const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// react-native-youtube-iframe (bản web) cần "react-native-web-webview" nhưng gói này chưa cài.
// Trên web, trỏ nó sang stub để bundle không bị lỗi.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-web-webview") {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "utils/stubs/react-native-web-webview.js"),
    };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
