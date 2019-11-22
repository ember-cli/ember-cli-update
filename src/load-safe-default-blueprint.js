'use strict';

const loadSafeBlueprint = require('./load-safe-blueprint');
const { defaultBlueprintName } = require('./constants');

function loadSafeDefaultBlueprint(projectOptions = [], version) {
  let type = 'app';
  if (projectOptions.includes('addon')) {
    type = 'addon';
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
    packageName: defaultBlueprintName,
    name: defaultBlueprintName,
    type,
    version,
    options,
    isBaseBlueprint: true
  });
}

module.exports = loadSafeDefaultBlueprint;
