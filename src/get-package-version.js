'use strict';

module.exports = function getPackageVersion({
  devDependencies
}, packageName) {
  let packageVersion;

  if (devDependencies) {
    packageVersion = devDependencies[packageName];
  }

  if (!packageVersion) {
    throw 'Ember CLI blueprint version could not be determined';
  }

  return packageVersion;
};
