'use strict';

const fs = require('fs');
const path = require('path');
const npm = require('boilerplate-update/src/npm');

/**
 * Run npm view to get the package.json and parse it to check if it contains property
 * to override the default blueprint name
 *
 * @param {string} packageNameOrPath - Name of package i.e. ember-cli-package-name or path to a local package
 * @param {string} cwd - Default to the process's CWD. Parent functions can override
 * @returns {Promise<Array<string>>}
 */
module.exports = async function getBlueprintNameOverride(packageNameOrPath, cwd = process.cwd()) {
  let localPackageJsonPath = path.join(path.resolve(cwd, packageNameOrPath), 'package.json');
  let packageJson;

  if (fs.existsSync(localPackageJsonPath)) {
    packageJson = JSON.parse(fs.readFileSync(localPackageJsonPath));
  } else {
    try {
      packageJson = await module.exports.npmJson('view', packageNameOrPath, '--json');
    } catch (err) {
      return null;
    }
  }

  if (packageJson['ember-addon'] && packageJson['ember-addon']['defaultBlueprint']) {
    return packageJson['ember-addon']['defaultBlueprint'];
  }

  return null;
};

module.exports.npmJson = npm.json;
