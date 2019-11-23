'use strict';

const parseBlueprint = require('./parse-blueprint');
const downloadPackage = require('./download-package');

const toDefault = require('./args').to.default;

async function checkForBlueprintUpdates(blueprints) {
  return await Promise.all(blueprints.map(async blueprint => {
    let parsedBlueprint = await parseBlueprint(blueprint.location || blueprint.name);

    let [
      { version: currentVersion },
      { version: latestVersion }
    ] = await Promise.all([
      downloadPackage(parsedBlueprint.name, parsedBlueprint.url, blueprint.version),
      downloadPackage(parsedBlueprint.name, parsedBlueprint.url, toDefault)
    ]);

    return {
      packageName: blueprint.packageName,
      name: blueprint.name,
      currentVersion,
      latestVersion,
      isUpToDate: currentVersion === latestVersion
    };
  }));
}

module.exports = checkForBlueprintUpdates;
