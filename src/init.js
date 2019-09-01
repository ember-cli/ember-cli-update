'use strict';

const run = require('./run');
const getProjectOptions = require('./get-project-options');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprint = require('./parse-blueprint');
const downloadBlueprint = require('./download-blueprint');
const saveBlueprint = require('./save-blueprint');
const saveDefaultBlueprint = require('./save-default-blueprint');
const loadSafeDefaultBlueprint = require('./load-safe-default-blueprint');
const loadSafeBlueprint = require('./load-safe-blueprint');

module.exports = async function init({
  blueprint: _blueprint,
  to,
  resolveConflicts,
  reset,
  blueprintOptions,
  wasRunAsExecutable
}) {
  let defaultBlueprint = {
    name: 'ember-cli'
  };

  let cwd = process.cwd();

  let parsedBlueprint;
  if (_blueprint) {
    parsedBlueprint = await parseBlueprint(_blueprint);
  } else {
    parsedBlueprint = defaultBlueprint;
  }

  let blueprint = await downloadBlueprint(parsedBlueprint.name, parsedBlueprint.url, to);

  blueprint.options = blueprintOptions;

  let isCustomBlueprint = blueprint.name !== defaultBlueprint.name;

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
    ignoredFiles: ['config/ember-cli-update.json'],
    wasRunAsExecutable
  })).promise;

  if (isCustomBlueprint) {
    await saveBlueprint({
      cwd,
      name: blueprint.name,
      location: parsedBlueprint.location,
      version: blueprint.version
    });
  } else {
    await saveDefaultBlueprint({
      cwd,
      blueprint
    });
  }

  if (!reset) {
    await run('git add config/ember-cli-update.json');
  }

  return result;
};
