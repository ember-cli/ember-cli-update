'use strict';

const loadSafeBlueprint = require('./load-safe-blueprint');
const getRemoteUrl = require('./get-remote-url');
const {
  defaultPackageName,
  defaultAppBlueprintName,
  defaultAddonBlueprintName,
  glimmerPackageName
} = require('./constants');

function loadDefaultBlueprint(projectOptions = [], version) {
  let packageName = defaultPackageName;
  let name;
  let codemodsSource;
  if (projectOptions.includes('addon')) {
    name = defaultAddonBlueprintName;
    codemodsSource = 'ember-addon-codemods-manifest@1';
  } else if (projectOptions.includes('glimmer')) {
    packageName = glimmerPackageName;
    name = glimmerPackageName;
  } else {
    name = defaultAppBlueprintName;
    codemodsSource = 'ember-app-codemods-manifest@1';
  }

  let options = [];
  if (!projectOptions.includes('glimmer')) {
    if (projectOptions.includes('yarn')) {
      options.push('--yarn');
    }
    if (
      !projectOptions.includes('welcome') ||
      projectOptions.includes('addon')
    ) {
      // Why do addons always have --no-welcome?
      options.push('--no-welcome');
    }
  }

  return loadSafeBlueprint({
    packageName,
    name,
    version,
    outputRepo: getRemoteUrl(projectOptions),
    ...(codemodsSource ? { codemodsSource } : {}),
    options,
    isBaseBlueprint: true
  });
}

module.exports = loadDefaultBlueprint;
