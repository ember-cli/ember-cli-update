'use strict';

const utils = require('./utils');

module.exports = function getVersions(projectType) {
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

  let versions = JSON.parse(
    utils.run(`npm info ${pkg} versions --json`)
  );

  return versions;
};
