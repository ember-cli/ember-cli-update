'use strict';

function findBlueprint(blueprints, packageName, blueprintName) {
  let blueprint = blueprints.find(b => {
    return b.packageName === packageName && b.name === blueprintName;
  });

  return blueprint;
}

module.exports = findBlueprint;
