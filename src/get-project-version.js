'use strict';

const run = require('./run');
const semver = require('semver');

module.exports = function getProjectVersion(packageVersion) {
  let versions = JSON.parse(
    run('npm info ember-cli versions --json')
  );

  let projectVersion = semver.minSatisfying(versions, packageVersion);

  return `v${projectVersion}`;
};
