'use strict';

const npm = require('boilerplate-update/src/npm');

module.exports = async function getVersions(packageName) {
  return await npm.json(`view ${packageName} versions`);
};
