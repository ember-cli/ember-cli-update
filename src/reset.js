'use strict';

const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprintPackage = require('./parse-blueprint-package');
const saveBlueprint = require('./save-blueprint');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const { getBlueprintRelativeFilePath } = require('./get-blueprint-file-path');
const getBaseBlueprint = require('./get-base-blueprint');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const resolvePackage = require('./resolve-package');
const { defaultTo } = require('./constants');
const chooseBlueprintUpdates = require('./choose-blueprint-updates');
const getBlueprintFromArgs = require('./get-blueprint-from-args');
const loadDefaultBlueprintFromDisk = require('./load-default-blueprint-from-disk');

module.exports = async function reset({
  cwd = process.cwd(),
  packageName,
  blueprint: _blueprint,
  to = defaultTo
} = {}) {
  try {
    // A custom config location in package.json may be reset/init away,
    // so we can no longer look it up on the fly after the run.
    // We must rely on a lookup before the run.
    let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

    let emberCliUpdateJson = await loadSafeBlueprintFile(emberCliUpdateJsonPath);

    let { blueprints } = emberCliUpdateJson;

    let blueprint;
    let packageInfo;

    if (_blueprint) {
      let {
        packageInfo: _packageInfo,
        existingBlueprint
      } = await getBlueprintFromArgs({
        cwd,
        emberCliUpdateJson,
        packageName,
        blueprint: _blueprint,
        to
      });

      packageInfo = _packageInfo;
      blueprint = existingBlueprint;
    } else {
      if (blueprints.length) {
        let {
          blueprint: _blueprint
        } = await chooseBlueprintUpdates({
          cwd,
          emberCliUpdateJson,
          reset: true
        });

        blueprint = _blueprint;
      } else {
        blueprint = await loadDefaultBlueprintFromDisk(cwd);
      }

      let parsedPackage = await parseBlueprintPackage({
        cwd,
        packageName: blueprint.location || blueprint.packageName
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
      cwd,
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
  } catch (err) {
    return { promise: Promise.reject(err) };
  }
};
