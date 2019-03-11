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

  let allDeps = Object.assign({}, dependencies, devDependencies);

  let isGlimmer = allDeps['@glimmer/blueprint'];

  if (isGlimmer) {
    return ['glimmer'];
  }

  let isApp = allDeps['ember-cli'];

  if (isApp) {
    return ['app'];
  }

  throw 'Ember CLI project type could not be determined';
};
