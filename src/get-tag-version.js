'use strict';

const utils = require('./utils');
const semver = require('semver');

const distTags = [
  'latest',
  'beta'
];

module.exports = function getTagVersion(to, versions, projectType) {
  return '3.4.2';
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
