'use strict';

const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprintPackage = require('./parse-blueprint-package');
const saveBlueprint = require('./save-blueprint');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const { getBlueprintRelativeFilePath } = require('./get-blueprint-file-path');
const findBlueprint = require('./find-blueprint');
const getBaseBlueprint = require('./get-base-blueprint');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const resolvePackage = require('./resolve-package');
const { defaultTo } = require('./constants');
const chooseBlueprintUpdates = require('./choose-blueprint-updates');

module.exports = async function reset({
  blueprint: _blueprint,
  to = defaultTo
}) {
  let cwd = process.cwd();

  // A custom config location in package.json may be reset/init away,
  // so we can no longer look it up on the fly after the run.
  // We must rely on a lookup before the run.
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let emberCliUpdateJson = await loadSafeBlueprintFile(emberCliUpdateJsonPath);

  let { blueprints } = emberCliUpdateJson;

  if (!blueprints.length) {
    throw new Error('No blueprints found.');
  }

  let blueprint;
  let packageInfo;

  if (_blueprint) {
    let parsedPackage = await parseBlueprintPackage({
      cwd,
      blueprint: _blueprint
    });
    let url = parsedPackage.url;

    packageInfo = await resolvePackage({
      name: parsedPackage.name,
      url,
      range: to
    });

    let packageName = packageInfo.name;
    let name = packageInfo.name;

    let existingBlueprint = findBlueprint(emberCliUpdateJson, packageName, name);
    if (!existingBlueprint) {
      throw new Error('Blueprint not found.');
    }

    blueprint = existingBlueprint;
  } else {
    let {
      blueprint: _blueprint
    } = await chooseBlueprintUpdates({
      cwd,
      emberCliUpdateJson,
      reset: true
    });

    blueprint = _blueprint;

    let parsedPackage = await parseBlueprintPackage({
      cwd,
      blueprint: blueprint.location || blueprint.packageName
    });
    let url = parsedPackage.url;

    packageInfo = await resolvePackage({
      name: blueprint.packageName,
      url,
      range: to
    });
  }

  blueprint.version = packageInfo.version;
  blueprint.path = packageInfo.path;

  let baseBlueprint;
  if (!blueprint.isBaseBlueprint) {
    baseBlueprint = await getBaseBlueprint({
      cwd,
      blueprints,
      blueprint
    });
  }

  let {
    promise,
    resolveConflictsProcess
  } = await boilerplateUpdate({
    endVersion: blueprint.version,
    reset: true,
    createCustomDiff: true,
    customDiffOptions: ({
      packageJson
    }) => getStartAndEndCommands({
      packageJson,
      baseBlueprint,
      endBlueprint: blueprint
    }),
    ignoredFiles: [await getBlueprintRelativeFilePath(cwd)]
  });

  return {
    promise: (async() => {
      let result = await promise;

      await saveBlueprint({
        emberCliUpdateJsonPath,
        blueprint
      });

      return result;
    })(),
    resolveConflictsProcess
  };
};
