'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function getPackageVersion(projectPath, projectType) {
  let packagePath = path.join(projectPath, 'package.json');

  let packageJson;

  try {
    packageJson = fs.readFileSync(packagePath, 'utf8');
  } catch (err) {
    throw 'No package.json was found in this directory';
  }

  try {
    packageJson = JSON.parse(packageJson);
  } catch (err) {
    throw 'The package.json is malformed';
  }

  let packageVersion;

  let { devDependencies } = packageJson;

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
