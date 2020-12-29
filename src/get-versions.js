'use strict';

const npm = require('boilerplate-update/src/npm');

/**
 * Returns an array of strings i.e.
 * [
 *   "0.0.0",
 *   "3.23.0-beta.2"
 * ]
 * @param packageName
 * @returns {Promise<Array<string>>}
 */
module.exports = async function getVersions(packageName) {
  return await npm.json('view', packageName, 'versions');
};
