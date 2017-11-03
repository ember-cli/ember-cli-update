'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function getProjectType(projectPath) {
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

  let keywords = packageJson.keywords;

  let isAddon = keywords && keywords.indexOf('ember-addon') !== -1;

  if (isAddon) {
    return 'addon';
  }

  let devDependencies = packageJson.devDependencies;

  if (devDependencies) {
    let isGlimmer = devDependencies['@glimmer/blueprint'];

    if (isGlimmer) {
      return 'glimmer';
    }

    let isApp = devDependencies['ember-cli'];

    if (isApp) {
      return 'app';
    }
  }

  throw 'Ember CLI project type could not be determined';
};
