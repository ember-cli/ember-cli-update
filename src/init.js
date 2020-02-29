'use strict';

const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprintPackage = require('./parse-blueprint-package');
const saveBlueprint = require('./save-blueprint');
const loadDefaultBlueprintFromDisk = require('./load-default-blueprint-from-disk');
const loadSafeBlueprint = require('./load-safe-blueprint');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const stageBlueprintFile = require('./stage-blueprint-file');
const { getBlueprintRelativeFilePath } = require('./get-blueprint-file-path');
const findBlueprint = require('./find-blueprint');
const getBaseBlueprint = require('./get-base-blueprint');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const resolvePackage = require('./resolve-package');
const { defaultTo } = require('./constants');

module.exports = async function init({
  cwd = process.cwd(),
  blueprint: _blueprint,
  to = defaultTo,
  resolveConflicts,
  outputRepo,
  codemodsSource,
  blueprintOptions = []
}) {
  // A custom config location in package.json may be reset/init away,
  // so we can no longer look it up on the fly after the run.
  // We must rely on a lookup before the run.
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

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
    name = parsedPackage.name;
    location = parsedPackage.location;
    url = parsedPackage.url;
  } else {
    let defaultBlueprint = await loadDefaultBlueprintFromDisk(cwd);
    packageName = defaultBlueprint.packageName;
    name = defaultBlueprint.name;
    if (!outputRepo) {
      outputRepo = defaultBlueprint.outputRepo;
    }
    if (!codemodsSource) {
      codemodsSource = defaultBlueprint.codemodsSource;
    }
  }

  let packageInfo = await resolvePackage({
    name: packageName,
    url,
    range: to
  });

  packageName = packageInfo.name;
  if (!name) {
    name = packageInfo.name;
  }
  let version = packageInfo.version;
  let path = packageInfo.path;

  let emberCliUpdateJson = await loadSafeBlueprintFile(emberCliUpdateJsonPath);

  let { blueprints } = emberCliUpdateJson;

  let blueprint;

  let existingBlueprint = findBlueprint(emberCliUpdateJson, packageName, name);
  if (existingBlueprint) {
    blueprint = existingBlueprint;
  } else {
    blueprint = loadSafeBlueprint({
      packageName,
      name,
      location,
      options: blueprintOptions
    });
  }

  blueprint.version = version;
  blueprint.path = path;

  if (outputRepo) {
    blueprint.outputRepo = outputRepo;
  }
  if (codemodsSource) {
    blueprint.codemodsSource = codemodsSource;
  }

  let baseBlueprint = await getBaseBlueprint({
    cwd,
    blueprints,
    blueprint
  });

  let init = false;

  if (!baseBlueprint) {
    // for non-existing default blueprints
    blueprint.isBaseBlueprint = true;
    init = true;
  }

  let {
    promise,
    resolveConflictsProcess
  } = await boilerplateUpdate({
    cwd,
    endVersion: blueprint.version,
    resolveConflicts,
    init,
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

      if (!init) {
        await stageBlueprintFile({
          cwd,
          emberCliUpdateJsonPath
        });
      }

      return result;
    })(),
    resolveConflictsProcess
  };
};
