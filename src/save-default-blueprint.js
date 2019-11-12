'use strict';

const path = require('path');
const getProjectOptions = require('./get-project-options');
const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const loadSafeDefaultBlueprint = require('./load-safe-default-blueprint');
const utils = require('./utils');

async function saveDefaultBlueprint({
  cwd,
  blueprint
}) {
  if (!blueprint.version) {
    let packageJson = utils.require(path.join(cwd, 'package'));

    let projectOptions = await getProjectOptions(packageJson);

    let packageName = 'ember-cli';
    let packageVersion = getPackageVersion(packageJson, packageName);

    let versions = await utils.getVersions(packageName);

    let version = getProjectVersion(packageVersion, versions, projectOptions);

    blueprint = loadSafeDefaultBlueprint(projectOptions, version);
  }

  await utils.saveBlueprint({
    cwd,
    name: blueprint.name,
    type: blueprint.type,
    version: blueprint.version,
    isBaseBlueprint: true,
    options: blueprint.options
  });
}

module.exports = saveDefaultBlueprint;
