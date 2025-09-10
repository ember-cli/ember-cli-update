'use strict';

const path = require('path');
const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const loadDefaultBlueprint = require('./load-default-blueprint');
const utils = require('./utils');

/**
 * Generate the configuration for the "base blueprint" which is the blueprint that first created
 * the ember project
 *
 * @param {string} cwd - Current working directory expected to be a node project path
 * @param {string} version - Optional. if not pass will use the one specified in package json
 * @returns {Promise<*|{}>}
 */
async function loadDefaultBlueprintFromDisk({ cwd, version }) {
  let packageJson;
  try {
    packageJson = utils.require(path.join(cwd, 'package'));
  } catch {
    // do nothing
  }

  let projectOptions;

  if (packageJson) {
    projectOptions = await getProjectOptions(packageJson);

    if (!version) {
      let packageName = getPackageName(projectOptions);
      let packageVersion = getPackageVersion(packageJson, packageName);

      let versions = await utils.getVersions(packageName);

      version = getProjectVersion(packageVersion, versions, projectOptions);
    }
  }

  return loadDefaultBlueprint(projectOptions, version);
}

module.exports = loadDefaultBlueprintFromDisk;
