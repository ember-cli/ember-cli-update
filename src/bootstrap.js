'use strict';

const path = require('path');
const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getPackageVersion = require('./get-package-version');
const getVersions = require('./get-versions');
const getProjectVersion = require('./get-project-version');
const saveBlueprint = require('./save-blueprint');
const loadDefaultBlueprint = require('./load-default-blueprint');
const getBlueprintFilePath = require('./get-blueprint-file-path');

module.exports = async function bootstrap({
  cwd = process.cwd()
} = {}) {
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let packageJson = require(path.join(cwd, 'package'));

  let projectOptions = await getProjectOptions(packageJson);

  let packageName = getPackageName(projectOptions);
  let packageVersion = getPackageVersion(packageJson, packageName);

  let versions = await getVersions(packageName);

  let version = getProjectVersion(packageVersion, versions, projectOptions);

  let blueprint = loadDefaultBlueprint(projectOptions, version);

  await saveBlueprint({
    emberCliUpdateJsonPath,
    blueprint
  });
};
