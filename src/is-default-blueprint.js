'use strict';

const {
  defaultPackageName,
  defaultAppBlueprintName,
  defaultAddonBlueprintName,
  glimmerPackageName
} = require('./constants');

function isDefaultBlueprint({ packageName, name }) {
  if (packageName === glimmerPackageName && name === glimmerPackageName) {
    return true;
  }
  return packageName === defaultPackageName && [
    defaultAppBlueprintName,
    defaultAddonBlueprintName
  ].includes(name);
}

module.exports = isDefaultBlueprint;
