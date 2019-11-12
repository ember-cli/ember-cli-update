'use strict';

const getProjectOptions = require('./get-project-options');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprint = require('./parse-blueprint');
const downloadBlueprint = require('./download-blueprint');
const saveBlueprint = require('./save-blueprint');
const saveDefaultBlueprint = require('./save-default-blueprint');
const loadSafeDefaultBlueprint = require('./load-safe-default-blueprint');
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
  let defaultBlueprint = loadSafeDefaultBlueprint();

  let cwd = process.cwd();

  let parsedBlueprint;
  if (_blueprint) {
    parsedBlueprint = await parseBlueprint(_blueprint);
  } else {
    parsedBlueprint = defaultBlueprint;
  }

  let blueprint = await downloadBlueprint(parsedBlueprint.name, parsedBlueprint.url, to);

  blueprint.options = blueprintOptions;

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
        blueprint = loadSafeDefaultBlueprint(projectOptions, blueprint.version);
      } else {
        blueprint = loadSafeBlueprint(blueprint);
      }

      return getStartAndEndCommands({
        packageJson,
        endBlueprint: blueprint
      });
    },
    ignoredFiles: [await getBlueprintFilePath(cwd)],
    wasRunAsExecutable
  })).promise;

  if (isCustomBlueprint) {
    await saveBlueprint({
      cwd,
      name: blueprint.name,
      location: parsedBlueprint.location,
      version: blueprint.version,
      isBaseBlueprint: true
    });
  } else {
    await saveDefaultBlueprint({
      cwd,
      blueprint
    });
  }

  if (!reset) {
    await stageBlueprintFile(cwd);
  }

  return result;
};
