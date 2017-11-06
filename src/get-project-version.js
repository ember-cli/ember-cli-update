'use strict';

const semver = require('semver');

const glimmerVersionCutoff = '0.6.3';

module.exports = function getProjectVersion(packageVersion, versions, projectType) {
  let projectVersion = semver.minSatisfying(versions, packageVersion);

  if (projectType === 'glimmer' && semver.lt(projectVersion, glimmerVersionCutoff)) {
    throw `This Glimmer app was generated using a blueprint version older than v${glimmerVersionCutoff}, and therefore the version cannot be determined. Please use the "--from" option to indicate your starting version.`;
  }

  return projectVersion;
};
