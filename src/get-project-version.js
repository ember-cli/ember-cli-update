'use strict';

const semver = require('semver');

module.exports = function getProjectVersion(packageVersion, versions) {
  let projectVersion = semver.minSatisfying(versions, packageVersion);

  return `v${projectVersion}`;
};
