'use strict';

const {
  defaultPackageName,
  defaultAppBlueprintName,
  defaultAddonBlueprintName
} = require('./constants');

function isDefaultBlueprint({ packageName, name }) {
  return packageName === defaultPackageName && [
    defaultAppBlueprintName,
    defaultAddonBlueprintName
  ].includes(name);
}

module.exports = isDefaultBlueprint;
