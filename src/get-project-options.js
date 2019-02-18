'use strict';

module.exports = function getProjectOptions({
  keywords,
  devDependencies
}) {
  let isAddon = keywords && keywords.indexOf('ember-addon') !== -1;

  if (isAddon) {
    return ['addon'];
  }

  if (devDependencies) {
    let isGlimmer = devDependencies['@glimmer/blueprint'];

    if (isGlimmer) {
      return ['glimmer'];
    }

    let isApp = devDependencies['ember-cli'];

    if (isApp) {
      return ['app'];
    }
  }

  throw 'Ember CLI project type could not be determined';
};
