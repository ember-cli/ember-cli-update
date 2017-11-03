'use strict';

module.exports = function getProjectType(packageJson) {
  let keywords = packageJson.keywords;

  let isAddon = keywords && keywords.indexOf('ember-addon') !== -1;

  return isAddon ? 'addon' : 'app';
};
