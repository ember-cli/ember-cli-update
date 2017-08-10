'use strict';

const run = require('./run');
const semver = require('semver');

const distTags = [
  'latest',
  'beta'
];

module.exports = function getTagVersion(to) {
  let distTag;
  let version;
  if (distTags.indexOf(to) > -1) {
    distTag = to;
  } else {
    version = to;
  }

  if (version) {
    let isAbsolute = semver.clean(version);
    if (!isAbsolute) {
      let versions = JSON.parse(
        run('npm info ember-cli versions --json')
      );

      version = semver.maxSatisfying(versions, version);
    }
  } else {
    version = JSON.parse(
      run(`npm info ember-cli@${distTag} version --json`)
    );
  }

  return `v${version}`;
};
