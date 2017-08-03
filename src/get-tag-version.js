'use strict';

const run = require('./run');

module.exports = function getTagVersion(version, distTag) {
  if (!version) {
    version = JSON.parse(
      run(`npm info ember-cli@${distTag} version --json`)
    );
  }

  return `v${version}`;
};
