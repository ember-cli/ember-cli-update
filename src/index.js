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
const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadBlueprintFile = require('./load-blueprint-file');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const saveBlueprint = require('./save-blueprint');
const checkForBlueprintUpdates = require('./check-for-blueprint-updates');
const loadDefaultBlueprint = require('./load-default-blueprint');
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
  let packageUrl;
  let isPersistedBlueprint;

  if (_blueprint) {
    let parsedPackage = await parseBlueprintPackage({
      cwd,
      blueprint: _blueprint
    });
    packageUrl = parsedPackage.url;

    let packageName = parsedPackage.name;
    if (!packageName) {
      let downloadedPackage = await downloadPackage(null, packageUrl, toDefault);
      packageName = downloadedPackage.name;
    }

    let existingBlueprint = findBlueprint(emberCliUpdateJson, packageName, packageName);
    if (existingBlueprint) {
      isPersistedBlueprint = true;
      blueprint = existingBlueprint;
    } else {
      blueprint = {
        packageName,
        name: packageName,
        location: parsedPackage.location
      };
    }

    blueprint = loadSafeBlueprint(blueprint);

    if (from) {
      blueprint.version = from;
    }

    if (!blueprint.version && !reset) {
      throw new Error('A custom blueprint cannot detect --from. You must supply it.');
    }
  } else {
    let { blueprints } = emberCliUpdateJson;

    if (!blueprints.length) {
      blueprint = loadDefaultBlueprint();
    } else {
      isPersistedBlueprint = true;

      let blueprintUpdates = await checkForBlueprintUpdates({
        cwd,
        blueprints
      });

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

      let existingBlueprint = findBlueprint(emberCliUpdateJson, blueprintUpdate.packageName, blueprintUpdate.name);
      blueprint = loadSafeBlueprint(existingBlueprint);
    }
  }

  if (blueprint.location && !packageUrl) {
    let parsedPackage = await parseBlueprintPackage({
      cwd,
      blueprint: blueprint.location
    });
    packageUrl = parsedPackage.url;
  }

  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  if (isCustomBlueprint) {
    createCustomDiff = true;
  }

  let endBlueprint;

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

      let startBlueprint;

      if (!isCustomBlueprint && createCustomDiff) {
        blueprint = loadDefaultBlueprint(projectOptions, blueprint.version);
      }

      if (!reset) {
        startBlueprint = { ...blueprint };
      }

      endBlueprint = { ...blueprint };

      if (isCustomBlueprint) {
        let [
          startDownloadedPackage,
          endDownloadedPackage
        ] = await Promise.all([
          startBlueprint ? downloadPackage(startBlueprint.packageName, packageUrl, startBlueprint.version) : null,
          downloadPackage(endBlueprint.packageName, packageUrl, to)
        ]);

        if (startBlueprint) {
          startBlueprint.path = startDownloadedPackage.path;
          startBlueprint.version = startDownloadedPackage.version;
        }

        endBlueprint.path = endDownloadedPackage.path;
        endBlueprint.version = endDownloadedPackage.version;
      } else {
        let packageName = getPackageName(projectOptions);
        let packageVersion = getPackageVersion(packageJson, packageName);

        let versions = await getVersions(packageName);

        let getTagVersion = _getTagVersion(versions, packageName);

        if (startBlueprint) {
          if (from) {
            startBlueprint.version = await getTagVersion(from);
          } else {
            startBlueprint.version = getProjectVersion(packageVersion, versions, projectOptions);
          }
        }

        endBlueprint.version = await getTagVersion(to);
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
        startVersion: startBlueprint && startBlueprint.version,
        endVersion: endBlueprint.version,
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
      await saveBlueprint({
        cwd
      });
    }

    if (isCustomBlueprint) {
      await saveBlueprint({
        cwd,
        blueprint: endBlueprint
      });
    }

    if (!reset) {
      await stageBlueprintFile(cwd);
    }
  } else if (isPersistedBlueprint) {
    await saveBlueprint({
      cwd,
      blueprint: endBlueprint
    });

    if (!reset) {
      await stageBlueprintFile(cwd);
    }
  }

  return result;
};
