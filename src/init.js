'use strict';

const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const saveBlueprint = require('./save-blueprint');
const loadDefaultBlueprintFromDisk = require('./load-default-blueprint-from-disk');
const loadSafeBlueprint = require('./load-safe-blueprint');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const stageBlueprintFile = require('./stage-blueprint-file');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const loadBlueprintFile = require('./load-blueprint-file');
const bootstrap = require('./bootstrap');
const findBlueprint = require('./find-blueprint');
const getBaseBlueprint = require('./get-base-blueprint');

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
    let parsedPackage = await parseBlueprintPackage({
      cwd,
      blueprint: _blueprint
    });
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

  let emberCliUpdateJson = await loadSafeBlueprintFile(cwd);

  let blueprint;

  let existingBlueprint = findBlueprint(emberCliUpdateJson, packageName, name);
  if (existingBlueprint) {
    blueprint = existingBlueprint;
  } else {
    blueprint = {
      packageName,
      name,
      location,
      options: blueprintOptions
    };
  }

  blueprint = loadSafeBlueprint(blueprint);

  blueprint.version = downloadedPackage.version;
  blueprint.path = downloadedPackage.path;

  let {
    baseBlueprint
  } = await getBaseBlueprint({
    cwd,
    emberCliUpdateJson,
    blueprint
  });

  if (!baseBlueprint) {
    // for non-existing default blueprints
    blueprint.isBaseBlueprint = true;
  }

  let result = await (await boilerplateUpdate({
    endVersion: blueprint.version,
    resolveConflicts,
    reset,
    createCustomDiff: true,
    customDiffOptions: ({
      packageJson
    }) => getStartAndEndCommands({
      packageJson,
      baseBlueprint,
      endBlueprint: blueprint
    }),
    ignoredFiles: [await getBlueprintFilePath(cwd)],
    wasRunAsExecutable
  })).promise;

  if (!await loadBlueprintFile(cwd)) {
    await bootstrap();
  }

  await saveBlueprint({
    cwd,
    blueprint
  });

  if (!reset) {
    await stageBlueprintFile(cwd);
  }

  return result;
};
