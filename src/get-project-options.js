'use strict';

module.exports = function getProjectOptions({
  keywords,
  dependencies,
  devDependencies
}) {

  let isAddon = keywords && keywords.indexOf('ember-addon') !== -1;

  if (isAddon) {
    return ['addon'];
  }

  function checkForDep(packageName) {
    return allDeps[packageName] !== undefined;
  }

  let allDeps = Object.assign({}, dependencies, devDependencies);

  let isGlimmer = checkForDep('@glimmer/blueprint');

  if (isGlimmer) {
    return ['glimmer'];
  }

  let isApp = checkForDep('ember-cli');

  if (isApp) {
    return ['app'];
  }

  throw 'Ember CLI project type could not be determined';
};
