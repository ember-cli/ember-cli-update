'use strict';

const loadSafeBlueprint = require('./load-safe-blueprint');
const {
  defaultPackageName,
  defaultAppBlueprintName,
  defaultAddonBlueprintName
} = require('./constants');

function loadDefaultBlueprint(projectOptions = [], version) {
  let name = defaultAppBlueprintName;
  if (projectOptions.includes('addon')) {
    name = defaultAddonBlueprintName;
  }

  let options = [];
  if (projectOptions.includes('yarn')) {
    options.push('--yarn');
  }
  if (!projectOptions.includes('welcome') || projectOptions.includes('addon')) {
    // Why do addons always have --no-welcome?
    options.push('--no-welcome');
  }

  return loadSafeBlueprint({
    packageName: defaultPackageName,
    name,
    version,
    options,
    isBaseBlueprint: true
  });
}

module.exports = loadDefaultBlueprint;
