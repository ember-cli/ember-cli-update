'use strict';

const boilerplateUpdate = require('boilerplate-update');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const chooseBlueprintUpdates = require('./choose-blueprint-updates');
const getBlueprintFromArgs = require('./get-blueprint-from-args');
const isDefaultBlueprint = require('./is-default-blueprint');
const getProjectOptions = require('./get-project-options');
const loadDefaultBlueprintFromDisk = require('./load-default-blueprint-from-disk');

module.exports = async function codemods({
  cwd = process.cwd(),
  blueprint: _blueprint,
  sourceJson,
  list
} = {}) {
  let blueprint;
  let codemodsSource;

  if (!sourceJson) {
    let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

    let emberCliUpdateJson = await loadSafeBlueprintFile(emberCliUpdateJsonPath);

    let { blueprints } = emberCliUpdateJson;

    if (_blueprint) {
      let {
        existingBlueprint
      } = await getBlueprintFromArgs({
        cwd,
        emberCliUpdateJson,
        blueprint: _blueprint
      });

      blueprint = existingBlueprint;
    } else if (blueprints.length) {
      let {
        blueprint: _blueprint
      } = await chooseBlueprintUpdates({
        cwd,
        emberCliUpdateJson,
        codemods: true
      });

      blueprint = _blueprint;
    } else {
      blueprint = await loadDefaultBlueprintFromDisk(cwd);
    }

    if (blueprint) {
      codemodsSource = blueprint.codemodsSource;
    }

    if (!codemodsSource) {
      throw 'no codemods for this blueprint';
    }
  }

  let {
    promise
  } = await boilerplateUpdate({
    cwd,
    projectOptions: async({ packageJson }) => {
      if (!blueprint) {
        return [];
      }
      if (isDefaultBlueprint(blueprint)) {
        return await getProjectOptions(packageJson, blueprint);
      }
      return blueprint.options;
    },
    listCodemods: list,
    codemodsSource,
    codemodsJson: sourceJson,
    runCodemods: !list
  });

  return await promise;
};
