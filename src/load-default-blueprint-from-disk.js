'use strict';

const path = require('path');
const getProjectOptions = require('./get-project-options');
const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const loadDefaultBlueprint = require('./load-default-blueprint');
const utils = require('./utils');

async function loadDefaultBlueprintFromDisk(cwd) {
  let packageJson = utils.require(path.join(cwd, 'package'));

  let projectOptions = await getProjectOptions(packageJson);

  let packageName = 'ember-cli';
  let packageVersion = getPackageVersion(packageJson, packageName);

  let versions = await utils.getVersions(packageName);

  let version = getProjectVersion(packageVersion, versions, projectOptions);

  let blueprint = loadDefaultBlueprint(projectOptions, version);

  return blueprint;
}

module.exports = loadDefaultBlueprintFromDisk;
