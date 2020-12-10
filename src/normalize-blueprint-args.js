'use strict';

/**
 * Ensure `packageName` attribute exists. Use the blueprintName if it is missing
 *
 * @param {string} packageName - Name of package
 * @param {string} blueprintName - Name of blueprint
 * @returns {{blueprintName, packageName}}
 */
function normalizeBlueprintArgs({
  packageName,
  blueprintName
}) {
  if (!packageName) {
    packageName = blueprintName;
  }

  return {
    packageName,
    blueprintName
  };
}

module.exports = normalizeBlueprintArgs;
