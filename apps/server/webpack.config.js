const { join } = require('path');
const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    '@shared': join(__dirname, '../../libs/shared/src'),
  };
  return config;
});
