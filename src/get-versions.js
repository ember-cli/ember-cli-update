'use strict';

const utils = require('./utils');

module.exports = function getVersions(projectType) {
  let packageName;

  switch (projectType) {
    case 'app':
    case 'addon':
      packageName = 'ember-cli';
      break;
    case 'glimmer':
      packageName = '@glimmer/blueprint';
      break;
  }

  return utils.getVersions(packageName);
};
