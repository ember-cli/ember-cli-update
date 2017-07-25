'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function getPackageVersion(projectPath) {
  let packagePath = path.join(projectPath, 'package.json');

  let packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  let packageVersion = packageJson.devDependencies['ember-cli'];

  return packageVersion;
};
