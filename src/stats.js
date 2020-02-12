'use strict';

const getBlueprintFilePath = require('./get-blueprint-file-path');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const checkForBlueprintUpdates = require('./check-for-blueprint-updates');
const { formatBlueprintLine } = require('./choose-blueprint-updates');
const getBlueprintFromArgs = require('./get-blueprint-from-args');

module.exports = async function stats({
  cwd = process.cwd(),
  blueprint
} = {}) {
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let emberCliUpdateJson = await loadSafeBlueprintFile(emberCliUpdateJsonPath);

  let { blueprints } = emberCliUpdateJson;

  if (!blueprints.length) {
    throw 'no blueprints found';
  }

  if (blueprint) {
    let {
      existingBlueprint
    } = await getBlueprintFromArgs({
      cwd,
      emberCliUpdateJson,
      blueprint
    });

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
