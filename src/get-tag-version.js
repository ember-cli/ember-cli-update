'use strict';

const run = require('./run');

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

  if (!version) {
    version = JSON.parse(
      run(`npm info ember-cli@${distTag} version --json`)
    );
  }

  return `v${version}`;
};
