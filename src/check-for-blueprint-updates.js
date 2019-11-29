'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');

const toDefault = require('./args').to.default;

async function checkForBlueprintUpdates({
  cwd,
  blueprints
}) {
  return await Promise.all(blueprints.map(async blueprint => {
    let parsedPackage = await parseBlueprintPackage({
      cwd,
      blueprint: blueprint.location || blueprint.packageName
    });

    let [
      { version: currentVersion },
      { version: latestVersion }
    ] = await Promise.all([
      downloadPackage(parsedPackage.name, parsedPackage.url, blueprint.version),
      downloadPackage(parsedPackage.name, parsedPackage.url, toDefault)
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
