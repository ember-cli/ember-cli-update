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

    let currentVersion;
    let latestVersion;

    if (parsedPackage.name) {
      let versions = await getVersions(parsedPackage.name);

      let tagVersions = await Promise.all([
        getTagVersion({
          range: blueprint.version,
          versions,
          packageName: blueprint.packageName
        }),
        getTagVersion({
          range: toDefault,
          versions,
          packageName: blueprint.packageName
        })
      ]);

      currentVersion = tagVersions[0];
      latestVersion = tagVersions[1];
    } else {
      let packages = await Promise.all([
        downloadPackage(parsedPackage.name, parsedPackage.url, blueprint.version),
        downloadPackage(parsedPackage.name, parsedPackage.url, toDefault)
      ]);

      currentVersion = packages[0].version;
      latestVersion = packages[1].version;
    }

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
