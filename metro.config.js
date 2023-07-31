/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const rootDir = __dirname;
module.exports = {
  resolver: {
    extraNodeModules: {
      "#node-web-compat": `${rootDir}/node_modules/aws-jwt-verify/dist/cjs/node-web-compat-web.js`,
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};