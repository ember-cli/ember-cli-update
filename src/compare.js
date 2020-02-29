'use strict';

const boilerplateUpdate = require('boilerplate-update');
const parseBlueprintPackage = require('./parse-blueprint-package');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const resolvePackage = require('./resolve-package');
const { defaultTo } = require('./constants');
const chooseBlueprintUpdates = require('./choose-blueprint-updates');
const getBlueprintFromArgs = require('./get-blueprint-from-args');
const loadDefaultBlueprintFromDisk = require('./load-default-blueprint-from-disk');

module.exports = async function compare({
  cwd = process.cwd(),
  blueprint: _blueprint,
  to = defaultTo
} = {}) {
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
        compare: true
      });

      blueprint = _blueprint;
    } else {
      blueprint = await loadDefaultBlueprintFromDisk(cwd);
    }

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

  let {
    promise
  } = await boilerplateUpdate({
    cwd,
    startVersion: blueprint.version,
    endVersion: packageInfo.version,
    remoteUrl: blueprint.outputRepo,
    compareOnly: true
  });

  await promise;
};
