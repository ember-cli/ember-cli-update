'use strict';

const { spawn } = require('./run');

/**
 * Run npm view to get the package.json and parse it to check if it contains property
 * to override the default blueprint name
 *
 * @param {string} packageName - Name of package
 * @returns {Promise<Array<string>>}
 */
module.exports = async function getBlueprintNameOverride(packageName) {
  let ps = await module.exports.spawn('npm', ['view', packageName, '--json']);

  if (ps.exitCode > 0) {
    return null;
  }

  const packageJson = JSON.parse(ps.stdout);

  if (packageJson['ember-addon'] && packageJson['ember-addon']['defaultBlueprint']) {
    return packageJson['ember-addon']['defaultBlueprint'];
  }

  return null;
};

module.exports.spawn = spawn;
