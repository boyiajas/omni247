const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const escapePathForRegex = filePath =>
  filePath
    .split(path.sep)
    .map(segment => segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[\\\\/]');

const backendPath = path.resolve(__dirname, 'backend');

const config = {
  resolver: {
    // Keep Metro out of the colocated backend tree so it does not burn
    // through inotify watchers on PHP dependencies.
    blockList: [
      new RegExp(`^${escapePathForRegex(backendPath)}[\\\\/].*$`),
      /[/\\]android[/\\](?:app[/\\])?build(?:[/\\].*)?$/,
      /[/\\]android[/\\]\.cxx(?:[/\\].*)?$/,
      /[/\\]ios[/\\]build(?:[/\\].*)?$/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
