'use strict';

const inquirer = require('inquirer');
const run = require('./run');
const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getPackageVersion = require('./get-package-version');
const getVersions = require('boilerplate-update/src/get-versions');
const getProjectVersion = require('./get-project-version');
const _getTagVersion = require('./get-tag-version');
const getRemoteUrl = require('./get-remote-url');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprint = require('./parse-blueprint');
const downloadBlueprint = require('./download-blueprint');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const saveBlueprint = require('./save-blueprint');

module.exports = async function emberCliUpdate({
  blueprint: _blueprint,
  from,
  to,
  resolveConflicts,
  runCodemods,
  reset,
  compareOnly,
  statsOnly,
  listCodemods,
  createCustomDiff,
  wasRunAsExecutable
}) {
  let defaultBlueprint = {
    name: 'ember-cli'
  };

  let cwd = process.cwd();

  let blueprint;

  if (_blueprint) {
    if (!from) {
      throw new Error('A custom blueprint cannot detect --from. You must supply it.');
    }

    blueprint = await parseBlueprint(_blueprint);
    blueprint.version = from;
  } else {
    let { blueprints } = await loadSafeBlueprintFile(cwd);

    let completeBlueprints = blueprints.filter(blueprint => !blueprint.isPartial);
    if (!completeBlueprints.length) {
      blueprints.splice(0, 0, defaultBlueprint);
    }

    if (blueprints.length > 1) {
      let answers = await inquirer.prompt([{
        type: 'list',
        message: 'Multiple blueprint updates have been found. Which would you like to update?',
        name: 'blueprint',
        choices: blueprints.map(blueprint => blueprint.name)
      }]);

      blueprint = blueprints.find(blueprint => blueprint.name === answers.blueprint);
    } else {
      blueprint = blueprints[0];
    }

    if (blueprint.location) {
      blueprint.url = (await parseBlueprint(blueprint.location)).url;
    }
  }

  let isCustomBlueprint = blueprint.name !== defaultBlueprint.name;

  if (isCustomBlueprint) {
    createCustomDiff = true;
  }

  let endVersion;

  let result = await (await boilerplateUpdate({
    projectOptions: ({ packageJson }) => getProjectOptions(packageJson, blueprint),
    mergeOptions: async function mergeOptions({
      packageJson,
      projectOptions
    }) {
      let startVersion;
      let startBlueprint;
      let endBlueprint;

      if (isCustomBlueprint) {
        startBlueprint = await downloadBlueprint(blueprint.name, blueprint.url, blueprint.version);
        endBlueprint = await downloadBlueprint(blueprint.name, blueprint.url, to);

        startVersion = startBlueprint.version;
        endVersion = endBlueprint.version;

        blueprint.name = startBlueprint.name;
      } else {
        let packageName = getPackageName(projectOptions);
        let packageVersion = getPackageVersion(packageJson, packageName);

        let versions = await getVersions(packageName);

        let getTagVersion = _getTagVersion(versions, packageName);

        if (from) {
          startVersion = await getTagVersion(from);
        } else {
          startVersion = getProjectVersion(packageVersion, versions, projectOptions);
        }

        endVersion = await getTagVersion(to);

        startBlueprint = endBlueprint = blueprint;
      }

      let customDiffOptions;
      if (createCustomDiff) {
        customDiffOptions = getStartAndEndCommands({
          packageJson,
          projectOptions,
          startVersion,
          endVersion,
          startBlueprint,
          endBlueprint
        });
      }

      return {
        startVersion,
        endVersion,
        customDiffOptions
      };
    },
    remoteUrl: ({ projectOptions }) => getRemoteUrl(projectOptions),
    compareOnly,
    resolveConflicts,
    reset,
    statsOnly,
    listCodemods,
    runCodemods,
    codemodsUrl: 'https://raw.githubusercontent.com/ember-cli/ember-cli-update-codemods-manifest/v3/manifest.json',
    createCustomDiff,
    ignoredFiles: ['ember-cli-update.json'],
    wasRunAsExecutable
  })).promise;

  let { blueprints } = await loadSafeBlueprintFile(cwd);

  let existingBlueprint = blueprints.find(b => b.name === blueprint.name);

  if (existingBlueprint) {
    await saveBlueprint({
      cwd,
      name: blueprint.name,
      version: endVersion
    });

    await run('git add ember-cli-update.json');
  }

  return result;
};
