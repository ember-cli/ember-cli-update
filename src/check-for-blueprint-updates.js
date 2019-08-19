'use strict';

const parseBlueprint = require('./parse-blueprint');
const downloadBlueprint = require('./download-blueprint');

const toDefault = require('./args').to.default;

async function checkForBlueprintUpdates(blueprints) {
  return await Promise.all(blueprints.map(async blueprint => {
    let parsedBlueprint = await parseBlueprint(blueprint.location || blueprint.name);

    let [
      { version: currentVersion },
      { version: latestVersion }
    ] = await Promise.all([
      downloadBlueprint(parsedBlueprint.name, parsedBlueprint.url, blueprint.version),
      downloadBlueprint(parsedBlueprint.name, parsedBlueprint.url, toDefault)
    ]);

    return {
      name: blueprint.name,
      currentVersion,
      latestVersion,
      isUpToDate: currentVersion === latestVersion
    };
  }));
}

module.exports = checkForBlueprintUpdates;
