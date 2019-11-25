'use strict';

const path = require('path');
const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getPackageVersion = require('./get-package-version');
const getVersions = require('boilerplate-update/src/get-versions');
const getProjectVersion = require('./get-project-version');
const saveBlueprint = require('./save-blueprint');
const loadSafeBlueprint = require('./load-safe-blueprint');
const loadDefaultBlueprint = require('./load-default-blueprint');
const stageBlueprintFile = require('./stage-blueprint-file');
const { glimmerPackageName } = require('./constants');

module.exports = async function bootstrap() {
  let cwd = process.cwd();

  let packageJson = require(path.join(cwd, 'package'));

  let projectOptions = await getProjectOptions(packageJson);

  let packageName = getPackageName(projectOptions);
  let packageVersion = getPackageVersion(packageJson, packageName);

  let versions = await getVersions(packageName);

  let version = getProjectVersion(packageVersion, versions, projectOptions);

  let blueprint;

  if (packageName === glimmerPackageName) {
    blueprint = loadSafeBlueprint({
      packageName,
      name: packageName,
      version
    });
  } else {
    blueprint = loadDefaultBlueprint(projectOptions, version);
  }

  await saveBlueprint({
    cwd,
    blueprint
  });

  await stageBlueprintFile(cwd);
};
