'use strict';

const path = require('path');
const fs = require('fs-extra');
const isDefaultBlueprint = require('./is-default-blueprint');

function getProjectType(checkForDep, keywords) {
  let isAddon = keywords && keywords.indexOf('ember-addon') !== -1;

  if (isAddon) {
    return 'addon';
  }

  let isGlimmer = checkForDep('@glimmer/blueprint');

  if (isGlimmer) {
    return 'glimmer';
  }

  let isApp = checkForDep('ember-cli');

  if (isApp) {
    return 'app';
  }

  throw new Error('Ember CLI project type could not be determined');
}

module.exports = async function getProjectOptions({
  keywords,
  dependencies,
  devDependencies
}, blueprint) {
  if (blueprint && !isDefaultBlueprint(blueprint)) {
    return ['blueprint'];
  }

  let allDeps = Object.assign({}, dependencies, devDependencies);

  function checkForDep(packageName) {
    return allDeps[packageName] !== undefined;
  }

  let projectType = getProjectType(checkForDep, keywords);

  let options = [projectType];

  let cwd = process.cwd();

  let isYarn;
  try {
    await fs.access(path.join(cwd, 'yarn.lock'), fs.constants.F_OK);
    isYarn = true;
  } catch (err) {}

  if (isYarn) {
    options.push('yarn');
  }

  // addons don't support the welcome option
  if (projectType === 'app') {
    let hasWelcome = checkForDep('ember-welcome-page');

    if (hasWelcome) {
      options.push('welcome');
    }
  }

  return options;
};
