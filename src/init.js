'use strict';

const getProjectOptions = require('./get-project-options');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const saveBlueprint = require('./save-blueprint');
const loadDefaultBlueprint = require('./load-default-blueprint');
const loadDefaultBlueprintFromDisk = require('./load-default-blueprint-from-disk');
const loadSafeBlueprint = require('./load-safe-blueprint');
const stageBlueprintFile = require('./stage-blueprint-file');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const isDefaultBlueprint = require('./is-default-blueprint');

module.exports = async function init({
  blueprint: _blueprint,
  to,
  resolveConflicts,
  reset,
  blueprintOptions,
  wasRunAsExecutable
}) {
  let cwd = process.cwd();

  let packageName;
  let name;
  let location;
  let url;
  if (_blueprint) {
    let parsedPackage = await parseBlueprintPackage(_blueprint);
    packageName = parsedPackage.name;
    location = parsedPackage.location;
    url = parsedPackage.url;
  } else {
    let defaultBlueprint = await loadDefaultBlueprintFromDisk(cwd);
    packageName = defaultBlueprint.packageName;
    name = defaultBlueprint.name;
  }

  let downloadedPackage = await downloadPackage(packageName, url, to);
  packageName = downloadedPackage.name;

  // could be "app" or "addon" already
  // don't want to overwrite with "ember-cli"
  if (!name) {
    name = downloadedPackage.name;
  }

  let blueprint = loadSafeBlueprint({
    packageName,
    name,
    location,
    path: downloadedPackage.path,
    version: downloadedPackage.version,
    isBaseBlueprint: true,
    options: blueprintOptions
  });

  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  let result = await (await boilerplateUpdate({
    projectOptions: ({ packageJson }) => getProjectOptions(packageJson, blueprint),
    endVersion: blueprint.version,
    resolveConflicts,
    reset,
    createCustomDiff: true,
    customDiffOptions: ({
      packageJson,
      projectOptions
    }) => {
      if (!isCustomBlueprint) {
        blueprint = loadDefaultBlueprint(projectOptions, blueprint.version);
      }

      return getStartAndEndCommands({
        packageJson,
        endBlueprint: blueprint
      });
    },
    ignoredFiles: [await getBlueprintFilePath(cwd)],
    wasRunAsExecutable
  })).promise;

  await saveBlueprint({
    cwd,
    blueprint
  });

  if (!reset) {
    await stageBlueprintFile(cwd);
  }

  return result;
};
