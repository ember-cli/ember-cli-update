'use strict';

function findBlueprint(emberCliUpdateJson, packageName, blueprintName) {
  let blueprint = emberCliUpdateJson.blueprints.find(b => {
    return b.packageName === packageName && b.name === blueprintName;
  });

  return blueprint;
}

module.exports = findBlueprint;
