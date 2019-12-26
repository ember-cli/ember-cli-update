'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const getVersions = require('boilerplate-update/src/get-versions');
const getTagVersion = require('boilerplate-update/src/get-tag-version');

const toDefault = require('./args').to.default;

async function checkForBlueprintUpdates({
  cwd,
  blueprints
}) {
  return await Promise.all(blueprints.map(async blueprint => {
    let currentVersion = blueprint.version;
    let latestVersion;

    if (!blueprint.location) {
      let versions = await getVersions(blueprint.packageName);

      latestVersion = await getTagVersion({
        range: toDefault,
        versions,
        packageName: blueprint.packageName
      });
    } else {
      let parsedPackage = await parseBlueprintPackage({
        cwd,
        blueprint: blueprint.location || blueprint.packageName
      });

      let downloadedPackage = await downloadPackage(blueprint.packageName, parsedPackage.url, toDefault);

      latestVersion = downloadedPackage.version;
    }

    return {
      blueprint,
      latestVersion,
      isUpToDate: currentVersion === latestVersion
    };
  }));
}

module.exports = checkForBlueprintUpdates;
