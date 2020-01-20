'use strict';

const getBlueprintFilePath = require('./get-blueprint-file-path');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const checkForBlueprintUpdates = require('./check-for-blueprint-updates');
const { formatBlueprintLine } = require('./choose-blueprint-updates');
const findBlueprint = require('./find-blueprint');

module.exports = async function stats({
  blueprint
} = {}) {
  let cwd = process.cwd();

  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let emberCliUpdateJson = await loadSafeBlueprintFile(emberCliUpdateJsonPath);

  let { blueprints } = emberCliUpdateJson;

  if (blueprint) {
    let existingBlueprint = findBlueprint(emberCliUpdateJson, blueprint, blueprint);

    if (!existingBlueprint) {
      throw `blueprint "${blueprint}" was not found`;
    }

    blueprints = [existingBlueprint];
  }

  let blueprintUpdates = await checkForBlueprintUpdates({
    cwd,
    blueprints
  });

  let stats = `${blueprintUpdates.map(formatBlueprintLine).join(`
`)}`;

  return stats;
};
