'use strict';

const path = require('path');
const fs = require('fs');

function normalizeBlueprintArgs({
  packageName,
  blueprintName
}) {
  let localLocation;

  if (!packageName) {
    let potentialLocalPath = path.join(
      process.cwd(),
      blueprintName,
      'package.json'
    );

    if (fs.existsSync(potentialLocalPath)) {
      packageName = require(potentialLocalPath).name;
      localLocation = potentialLocalPath;
    } else {
      packageName = blueprintName;
    }
  }

  return {
    packageName,
    blueprintName,
    localLocation
  };
}

module.exports = normalizeBlueprintArgs;
