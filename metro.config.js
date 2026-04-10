const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for .mjs files and ensure .js is resolved correctly in ESM
config.resolver.sourceExts.push('mjs');

module.exports = config;
