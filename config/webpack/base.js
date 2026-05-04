const { webpackConfig } = require('@rails/webpacker');

webpackConfig.resolve.extensions.push('.css');

module.exports = webpackConfig;
