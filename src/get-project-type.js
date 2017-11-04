'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function getProjectType(projectPath) {
  let packagePath = path.join(projectPath, 'package.json');

  let packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  let keywords = packageJson.keywords;

  let isAddon = keywords && keywords.indexOf('ember-addon') !== -1;

  return isAddon ? 'addon' : 'app';
};
