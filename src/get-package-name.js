'use strict';

module.exports = function getPackageName(projectOptions) {
  let packageName;
  if (projectOptions.includes('app') || projectOptions.includes('addon')) {
    packageName = 'ember-cli';
  } else if (projectOptions.includes('glimmer')) {
    packageName = '@glimmer/blueprint';
  }

  return packageName;
};
