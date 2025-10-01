'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const getTagVersion = require('boilerplate-update/src/get-tag-version');
const { defaultTo } = require('./constants');
const utils = require('./utils');

/**
 *
 * @param {Object} options
 * @param {string} options.cwd
 * @param {string} options.blueprintName
 * @returns {Promise<string>}
 */
async function getLatestVersion({ cwd, blueprint }) {
  if (blueprint.location) {
    let parsedPackage = await parseBlueprintPackage({
      cwd,
      packageName: blueprint.location || blueprint.packageName
    });

    let downloadedPackage = await downloadPackage(
      blueprint.packageName,
      parsedPackage.url,
      defaultTo
    );

    return downloadedPackage.version;
  }

  let versions = await utils.getVersions(blueprint.packageName);
  let latestVersion = await getTagVersion({
    range: defaultTo,
    versions,
    packageName: blueprint.packageName
  });

  return latestVersion;
}

async function checkForBlueprintUpdates({ cwd, blueprints }) {
  return await Promise.all(
    blueprints.map(async blueprint => {
      let currentVersion = blueprint.version;
      let latestVersion = await getLatestVersion({ cwd, blueprint });

      return {
        blueprint,
        latestVersion,
        isUpToDate: currentVersion === latestVersion
      };
    })
  );
}

module.exports = checkForBlueprintUpdates;
