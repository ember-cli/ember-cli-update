'use strict';

const path = require('path');
const run = require('./run');
const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getPackageVersion = require('./get-package-version');
const getVersions = require('boilerplate-update/src/get-versions');
const getProjectVersion = require('./get-project-version');
const saveDefaultBlueprint = require('./save-default-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadSafeDefaultBlueprint = require('./load-safe-default-blueprint');

module.exports = async function bootstrap() {
  let defaultBlueprint = {
    name: 'ember-cli'
  };

  let cwd = process.cwd();

  let packageJson = require(path.join(cwd, 'package'));

  let projectOptions = await getProjectOptions(packageJson);

  let packageName = getPackageName(projectOptions);
  let packageVersion = getPackageVersion(packageJson, packageName);

  let versions = await getVersions(packageName);

  let version = getProjectVersion(packageVersion, versions, projectOptions);

  let isCustomBlueprint = packageName !== defaultBlueprint.name;

  if (isCustomBlueprint) {
    await saveBlueprint({
      cwd,
      name: packageName,
      version
    });
  } else {
    let blueprint = loadSafeDefaultBlueprint(projectOptions, version);

    await saveDefaultBlueprint({
      cwd,
      blueprint
    });
  }

  await run('git add ember-cli-update.json');
};
