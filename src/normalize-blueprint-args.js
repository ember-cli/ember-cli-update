'use strict';

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
