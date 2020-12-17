'use strict';

const semver = require('semver');
const _getProjectVersion = require('boilerplate-update/src/get-project-version');

const glimmerVersionCutoff = '0.6.3';

/**
 * Fine the minimum version from `versions` array that matches the `packageVersion` range string
 *
 * @param {string} packageVersion - Can be a version range such as ^1.0.2 or an exact version
 * @param {array<string>} versions - Array of version strings available for package
 * @param {object} projectOptions - Glimmer projects are a special case
 * @returns {string}
 */
module.exports = function getProjectVersion(packageVersion, versions, projectOptions) {
  // _getProjectVersion gets the minimum version that satisfies the given packageVersion string
  let projectVersion = _getProjectVersion(packageVersion, versions);

  if (projectOptions.includes('glimmer') && semver.lt(projectVersion, glimmerVersionCutoff)) {
    throw `This Glimmer app was generated using a blueprint version older than v${glimmerVersionCutoff}, and therefore the version cannot be determined. Please use the "--from" option to indicate your starting version.`;
  }

  return projectVersion;
};
