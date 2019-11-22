'use strict';

const inquirer = require('inquirer');
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
const downloadPackage = require('./download-package');
const loadBlueprintFile = require('./load-blueprint-file');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const saveBlueprint = require('./save-blueprint');
const saveDefaultBlueprint = require('./save-default-blueprint');
const checkForBlueprintUpdates = require('./check-for-blueprint-updates');
const loadSafeDefaultBlueprint = require('./load-safe-default-blueprint');
const loadSafeBlueprint = require('./load-safe-blueprint');
const stageBlueprintFile = require('./stage-blueprint-file');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const isDefaultBlueprint = require('./is-default-blueprint');
const findBlueprint = require('./find-blueprint');

const {
  'to': { default: toDefault },
  'codemods-url': { default: codemodsUrlDefault }
} = require('./args');

function formatBlueprintLine({
  name,
  currentVersion,
  latestVersion
}) {
  return `${name}, current: ${currentVersion}, latest: ${latestVersion}`;
}

module.exports = async function emberCliUpdate({
  blueprint: _blueprint,
  from,
  to,
  resolveConflicts,
  runCodemods,
  codemodsUrl = codemodsUrlDefault,
  codemodsJson,
  reset,
  compareOnly,
  statsOnly,
  listCodemods,
  createCustomDiff,
  wasRunAsExecutable
}) {
  let cwd = process.cwd();

  let emberCliUpdateJson = await loadSafeBlueprintFile(cwd);

  let blueprint;

  if (_blueprint) {
    blueprint = await parseBlueprint(_blueprint);
    blueprint.packageName = blueprint.name;

    let { name } = blueprint;
    if (!name) {
      let downloadedPackage = await downloadPackage(null, blueprint.url, toDefault);
      name = downloadedPackage.name;
    }

    let existingBlueprint = findBlueprint(emberCliUpdateJson, name, name);
    if (existingBlueprint) {
      Object.assign(blueprint, existingBlueprint);
    }

    if (from) {
      blueprint.version = from;
    }

    if (!blueprint.version && !reset) {
      throw new Error('A custom blueprint cannot detect --from. You must supply it.');
    }
  } else {
    let { blueprints } = emberCliUpdateJson;

    if (!blueprints.length) {
      blueprint = loadSafeDefaultBlueprint();
    } else {
      let blueprintUpdates = await checkForBlueprintUpdates(blueprints);

      let areAllUpToDate = blueprintUpdates.every(blueprintUpdate => blueprintUpdate.isUpToDate);
      if (areAllUpToDate) {
        return `${blueprintUpdates.map(formatBlueprintLine).join(`
`)}

All blueprints are up-to-date!`;
      }

      let choicesByName = blueprintUpdates.reduce((choices, blueprintUpdate) => {
        let name = formatBlueprintLine(blueprintUpdate);
        choices[name] = {
          blueprintUpdate,
          choice: {
            name,
            disabled: blueprintUpdate.isUpToDate
          }
        };
        return choices;
      }, {});

      let answer = await inquirer.prompt([{
        type: 'list',
        message: 'Blueprint updates have been found. Which one would you like to update?',
        name: 'blueprint',
        choices: Object.values(choicesByName).map(({ choice }) => choice)
      }]);

      let { blueprintUpdate } = choicesByName[answer.blueprint];

      blueprint = findBlueprint(emberCliUpdateJson, blueprintUpdate.packageName, blueprintUpdate.name);
    }
  }

  if (!blueprint.url && blueprint.location) {
    blueprint.url = (await parseBlueprint(blueprint.location)).url;
  }

  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

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
      if (createCustomDiff && projectOptions.includes('glimmer')) {
        // ember-cli doesn't have a way to use non-latest blueprint versions
        // TODO: The above is not true anymore. This can be fixed.
        throw 'cannot checkout older versions of glimmer blueprint';
      }

      let startVersion;
      let startBlueprint;
      let endBlueprint;

      if (!isCustomBlueprint && createCustomDiff) {
        blueprint = loadSafeDefaultBlueprint(projectOptions, blueprint.version);
      } else {
        blueprint = loadSafeBlueprint(blueprint);
      }

      if (isCustomBlueprint) {
        startBlueprint = { ...blueprint, ...await downloadPackage(blueprint.name, blueprint.url, blueprint.version) };
        endBlueprint = { ...blueprint, ...await downloadPackage(blueprint.name, blueprint.url, to) };

        startVersion = startBlueprint.version;
        endVersion = endBlueprint.version;
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

        startBlueprint = { ...blueprint, version: startVersion };
        endBlueprint = { ...blueprint, version: endVersion };
      }

      let customDiffOptions;
      if (createCustomDiff) {
        customDiffOptions = getStartAndEndCommands({
          packageJson,
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
    codemodsUrl,
    codemodsJson,
    createCustomDiff,
    ignoredFiles: [await getBlueprintFilePath(cwd)],
    wasRunAsExecutable
  })).promise;

  if (_blueprint) {
    let emberCliUpdateJson = await loadBlueprintFile(cwd);

    // If you don't have a state file, save the default blueprint,
    // even if you are currently working on a custom blueprint.
    if (!emberCliUpdateJson || !isCustomBlueprint) {
      await saveDefaultBlueprint({
        cwd
      });
    }

    if (isCustomBlueprint) {
      await saveBlueprint({
        cwd,
        blueprint: loadSafeBlueprint({
          packageName: blueprint.packageName,
          name: blueprint.name,
          location: blueprint.location,
          version: endVersion
        })
      });
    }

    if (!reset) {
      await stageBlueprintFile(cwd);
    }
  } else {
    let emberCliUpdateJson = await loadSafeBlueprintFile(cwd);

    let existingBlueprint = findBlueprint(emberCliUpdateJson, blueprint.packageName, blueprint.name);

    if (existingBlueprint) {
      await saveBlueprint({
        cwd,
        blueprint: loadSafeBlueprint({
          packageName: blueprint.packageName,
          name: blueprint.name,
          version: endVersion
        })
      });

      if (!reset) {
        await stageBlueprintFile(cwd);
      }
    }
  }

  return result;
};
