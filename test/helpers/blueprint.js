'use strict';

const path = require('path');
const fs = require('fs-extra');
const { buildTmp } = require('git-fixtures');

async function initBlueprint(fixturesPath, location) {
  let blueprintPath = await buildTmp({
    fixturesPath
  });

  let newBlueprintPath = path.resolve(blueprintPath, location);

  await fs.remove(newBlueprintPath);

  await fs.move(blueprintPath, newBlueprintPath);

  return newBlueprintPath;
}

module.exports.initBlueprint = initBlueprint;
