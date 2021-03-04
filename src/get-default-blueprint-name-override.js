'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('./run');

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
  let packageJsonStr;

  if (fs.existsSync(localPackageJsonPath)) {
    packageJsonStr = fs.readFileSync(localPackageJsonPath);
  } else {
    let ps = await module.exports.spawn('npm', ['view', packageNameOrPath, '--json']);
    if (ps.exitCode > 0) {
      return null;
    }
    packageJsonStr = ps.stdout;
  }

  let packageJson = JSON.parse(packageJsonStr);

  if (packageJson['ember-addon'] && packageJson['ember-addon']['defaultBlueprint']) {
    return packageJson['ember-addon']['defaultBlueprint'];
  }

  return null;
};

module.exports.spawn = spawn;
