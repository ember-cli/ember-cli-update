'use strict';

const run = require('./run');

module.exports = function getTagVersion(distTag) {
  let version = JSON.parse(
    run(`npm info ember-cli@${distTag} version --json`)
  );

  return `v${version}`;
};
