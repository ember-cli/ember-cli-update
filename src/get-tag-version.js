'use strict';

const run = require('./run');

module.exports = function getTagVersion(tag) {
  let version = JSON.parse(
    run(`npm info ember-cli@${tag} version --json`)
  );

  return `v${version}`;
};
