'use strict';

const path = require('path');
const fs = require('fs-extra');

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
  if (blueprint && blueprint.name !== 'ember-cli') {
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

  let hasWelcome = checkForDep('ember-welcome-page');

  if (hasWelcome) {
    options.push('welcome');
  }

  return options;
};
