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
  let versions = await npm.json('view', packageName, 'versions');

  if (!Array.isArray(versions)) {
    versions = [versions];
  }

  return versions;
};
