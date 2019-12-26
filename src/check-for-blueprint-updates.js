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
    let parsedPackage = await parseBlueprintPackage({
      cwd,
      blueprint: blueprint.location || blueprint.packageName
    });

    let currentVersion = blueprint.version;
    let latestVersion;

    if (parsedPackage.name) {
      let versions = await getVersions(parsedPackage.name);

      latestVersion = await getTagVersion({
        range: toDefault,
        versions,
        packageName: blueprint.packageName
      });
    } else {
      let downloadedPackage = await downloadPackage(parsedPackage.name, parsedPackage.url, toDefault);

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
