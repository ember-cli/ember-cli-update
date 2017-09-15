'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function getPackageVersion(projectPath) {
  let packagePath = path.join(projectPath, 'package.json');

  let packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  let devDependencies = packageJson.devDependencies;

  let packageVersion = devDependencies && devDependencies['ember-cli'];

  return packageVersion;
};
