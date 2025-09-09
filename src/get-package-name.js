'use strict';

const { defaultPackageName, glimmerPackageName } = require('./constants');

module.exports = function getPackageName(projectOptions) {
  let packageName;
  if (projectOptions.includes('app') || projectOptions.includes('addon')) {
    packageName = defaultPackageName;
  } else if (projectOptions.includes('glimmer')) {
    packageName = glimmerPackageName;
  }

  return packageName;
};
