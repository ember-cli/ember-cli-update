'use strict';

module.exports = function getPackageVersion({
  dependencies,
  devDependencies
}, packageName) {
  let allDeps = Object.assign({}, dependencies, devDependencies);

  let packageVersion = allDeps[packageName];

  if (!packageVersion) {
    throw 'Ember CLI blueprint version could not be determined';
  }

  return packageVersion;
};
