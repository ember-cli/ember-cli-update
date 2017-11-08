'use strict';

const run = require('./run');
const semver = require('semver');

const distTags = [
  'latest',
  'beta'
];

module.exports = function getTagVersion(to, versions, projectType) {
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
      version = semver.maxSatisfying(versions, version);
    }
  } else {
    let pkg;

    switch (projectType) {
      case 'glimmer':
        pkg = '@glimmer/blueprint';
        break;
      default:
        pkg = 'ember-cli';
        break;
    }

    version = JSON.parse(
      run(`npm info ${pkg}@${distTag} version --json`)
    );
  }

  return version;
};
