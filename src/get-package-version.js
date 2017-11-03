'use strict';

module.exports = function getPackageVersion(packageJson) {
  let devDependencies = packageJson.devDependencies;

  let packageVersion = devDependencies && devDependencies['ember-cli'];

  return packageVersion;
};
