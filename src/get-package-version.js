'use strict';

module.exports = function getPackageVersion({
  devDependencies
}, projectType) {
  let packageVersion;

  if (devDependencies) {
    switch (projectType) {
      case 'app':
      case 'addon':
        packageVersion = devDependencies['ember-cli'];
        break;
      case 'glimmer':
        packageVersion = devDependencies['@glimmer/blueprint'];
        break;
    }
  }

  if (!packageVersion) {
    throw 'Ember CLI blueprint version could not be determined';
  }

  return packageVersion;
};
