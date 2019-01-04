'use strict';

const utils = require('./utils');
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
      let _version = semver.maxSatisfying(versions, version);
      if (_version) {
        version = _version;
      }
    }
  } else {
    let pkg;

    switch (projectType) {
      case 'app':
      case 'addon':
        pkg = 'ember-cli';
        break;
      case 'glimmer':
        pkg = '@glimmer/blueprint';
        break;
    }

    version = JSON.parse(
      utils.run(`npm info ${pkg}@${distTag} version --json`)
    );
  }

  return version;
};
