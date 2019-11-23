'use strict';

const path = require('path');
const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getPackageVersion = require('./get-package-version');
const getVersions = require('boilerplate-update/src/get-versions');
const getProjectVersion = require('./get-project-version');
const saveDefaultBlueprint = require('./save-default-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadSafeBlueprint = require('./load-safe-blueprint');
const loadSafeDefaultBlueprint = require('./load-safe-default-blueprint');
const stageBlueprintFile = require('./stage-blueprint-file');
const isDefaultBlueprint = require('./is-default-blueprint');

module.exports = async function bootstrap() {
  let cwd = process.cwd();

  let packageJson = require(path.join(cwd, 'package'));

  let projectOptions = await getProjectOptions(packageJson);

  let packageName = getPackageName(projectOptions);
  let packageVersion = getPackageVersion(packageJson, packageName);

  let versions = await getVersions(packageName);

  let version = getProjectVersion(packageVersion, versions, projectOptions);

  let blueprint = loadSafeBlueprint({
    packageName,
    name: packageName,
    version
  });

  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  if (isCustomBlueprint) {
    await saveBlueprint({
      cwd,
      blueprint
    });
  } else {
    let blueprint = loadSafeDefaultBlueprint(projectOptions, version);

    await saveDefaultBlueprint({
      cwd,
      blueprint
    });
  }

  await stageBlueprintFile(cwd);
};
