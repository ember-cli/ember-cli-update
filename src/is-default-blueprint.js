'use strict';

const { defaultBlueprintName } = require('./constants');

function isDefaultBlueprint({ packageName, name }) {
  return packageName === defaultBlueprintName && name === defaultBlueprintName;
}

module.exports = isDefaultBlueprint;
