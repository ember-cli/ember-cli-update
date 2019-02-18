'use strict';

const semver = require('semver');
const _getProjectVersion = require('boilerplate-update/src/get-project-version');

const glimmerVersionCutoff = '0.6.3';

module.exports = function getProjectVersion(packageVersion, versions, projectOptions) {
  let projectVersion = _getProjectVersion(packageVersion, versions);

  if (projectOptions.includes('glimmer') && semver.lt(projectVersion, glimmerVersionCutoff)) {
    throw `This Glimmer app was generated using a blueprint version older than v${glimmerVersionCutoff}, and therefore the version cannot be determined. Please use the "--from" option to indicate your starting version.`;
  }

  return projectVersion;
};
