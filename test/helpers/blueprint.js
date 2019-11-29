'use strict';

const path = require('path');
const fs = require('fs-extra');
const { buildTmp } = require('git-fixtures');

async function initBlueprint({
  fixturesPath,
  resolvedFrom,
  relativeDir
}) {
  let blueprintPath = await buildTmp({
    fixturesPath
  });

  let newBlueprintPath = path.resolve(resolvedFrom, relativeDir);

  await fs.remove(newBlueprintPath);

  await fs.move(blueprintPath, newBlueprintPath);

  return newBlueprintPath;
}

module.exports.initBlueprint = initBlueprint;
