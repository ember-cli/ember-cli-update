'use strict';

const loadSafeBlueprint = require('./load-safe-blueprint');
const {
  defaultPackageName,
  defaultAppBlueprintName,
  defaultAddonBlueprintName
} = require('./constants');

function loadDefaultBlueprint(projectOptions = [], version) {
  let name = defaultAppBlueprintName;
  let codemodsSource = 'ember-app-codemods-manifest@1';
  if (projectOptions.includes('addon')) {
    name = defaultAddonBlueprintName;
    codemodsSource = 'ember-addon-codemods-manifest@1';
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
    codemodsSource,
    options,
    isBaseBlueprint: true
  });
}

module.exports = loadDefaultBlueprint;
