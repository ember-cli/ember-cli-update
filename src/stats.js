'use strict';

const getBlueprintFilePath = require('./get-blueprint-file-path');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const checkForBlueprintUpdates = require('./check-for-blueprint-updates');
const getBlueprintFromArgs = require('./get-blueprint-from-args');
const isDefaultBlueprint = require('./is-default-blueprint');
const getProjectOptions = require('./get-project-options');
const path = require('path');
const utils = require('./utils');

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

  let stats = [];

  for (let blueprintUpdate of blueprintUpdates) {
    let { blueprint } = blueprintUpdate;

    let lines = [
      `package name: ${blueprint.packageName}`,
      ...blueprint.location ? [`package location: ${blueprint.location}`] : [],
      `blueprint name: ${blueprint.name}`,
      `current version: ${blueprint.version}`,
      `latest version: ${blueprintUpdate.latestVersion}`,
      ...blueprint.options.length ? [`options: ${blueprint.options.join(', ')}`] : [],
      ...blueprint.codemodsSource ? [
        `codemods source: ${blueprint.codemodsSource}`,
        `applicable codemods: ${await (async() => {
          let packageJson = require(path.join(cwd, 'package'));
          let projectOptions = isDefaultBlueprint(blueprintUpdate.blueprint)
            ? await getProjectOptions(packageJson, blueprint)
            : blueprint.options;
          return Object.keys(await utils.getApplicableCodemods({
            source: blueprint.codemodsSource,
            projectOptions,
            packageJson
          })).join(', ');
        })()}`
      ] : []
    ];

    stats.push(lines.join(`
`));
  }

  return stats.join(`

`);
};
