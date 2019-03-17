'use strict';

const path = require('path');
const co = require('co');
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

  throw 'Ember CLI project type could not be determined';
}

module.exports = co.wrap(function* getProjectOptions({
  keywords,
  dependencies,
  devDependencies
}) {
  let allDeps = Object.assign({}, dependencies, devDependencies);

  function checkForDep(packageName) {
    return allDeps[packageName] !== undefined;
  }

  let projectType = getProjectType(checkForDep, keywords);

  let options = [projectType];

  let cwd = process.cwd();

  let isYarn;
  try {
    yield fs.lstat(path.join(cwd, 'yarn.lock'));
    isYarn = true;
  } catch (err) {} // eslint-disable-line no-empty

  if (isYarn) {
    options.push('yarn');
  }

  let hasWelcome = checkForDep('ember-welcome-page');

  if (hasWelcome) {
    options.push('welcome');
  }

  return options;
});
