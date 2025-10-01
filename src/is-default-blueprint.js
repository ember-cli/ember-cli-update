'use strict';

const {
  defaultPackageName,
  defaultAppBlueprintName,
  defaultAddonBlueprintName,
  glimmerPackageName
} = require('./constants');

/**
 * A default blueprint either the `addon` or `app` blueprint provided by `ember-cli` or the `glimmer` one
 *
 * @param {string} packageName - Ensure this is one of the package names that contain the default blueprints
 * @param {string} name - Check if this is the name of one of the default blueprint names
 * @returns {boolean}
 */
function isDefaultBlueprint({ packageName, name }) {
  if (packageName === glimmerPackageName && name === glimmerPackageName) {
    return true;
  }

  return (
    packageName === defaultPackageName &&
    [defaultAppBlueprintName, defaultAddonBlueprintName].includes(name)
  );
}

module.exports = isDefaultBlueprint;
