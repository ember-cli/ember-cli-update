'use strict';

module.exports = function getPackageName(projectType) {
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

  return packageName;
};
