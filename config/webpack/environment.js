const { environment } = require('@rails/webpacker');
const webpack = require('webpack');
const WebpackAssetsManifest = require('webpack-assets-manifest');

// const splitChunks = {
//   optimization: {
//     splitChunks: {
//       chunks: 'all',
//     },
//   },
// };

// environment.config.merge(splitChunks);

// environment.plugins.prepend(
//   'Environment',
//   new webpack.EnvironmentPlugin(JSON.parse(JSON.stringify(process.env))),
// );
// Should override the existing manifest plugin
// environment.plugins.insert(
//   'Manifest',
//   new WebpackAssetsManifest({
//     output: 'manifest.json',
//     entrypoints: true, // default in rails is false
//     writeToDisk: true, // rails defaults copied from webpacker
//     publicPath: true, // rails defaults copied from webpacker
//   }),
// );

// environment.config.node = {
//   global: false,
//   __filename: false,
//   __dirname: false,
// };
console.log(environment);
module.exports = environment;
