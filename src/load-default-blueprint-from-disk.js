'use strict';

const path = require('path');
const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const loadDefaultBlueprint = require('./load-default-blueprint');
const utils = require('./utils');

async function loadDefaultBlueprintFromDisk(cwd, version) {
  let packageJson;
  try {
    packageJson = utils.require(path.join(cwd, 'package'));
  } catch (err) {}

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

  let blueprint = loadDefaultBlueprint(projectOptions, version);

  return blueprint;
}

module.exports = loadDefaultBlueprintFromDisk;
