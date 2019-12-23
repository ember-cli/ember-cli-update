'use strict';

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
const loadDefaultBlueprint = require('./load-default-blueprint');
const loadSafeBlueprint = require('./load-safe-blueprint');
const stageBlueprintFile = require('./stage-blueprint-file');
const { getBlueprintRelativeFilePath } = require('./get-blueprint-file-path');
const isDefaultBlueprint = require('./is-default-blueprint');
const findBlueprint = require('./find-blueprint');
const getBaseBlueprint = require('./get-base-blueprint');
const chooseBlueprintUpdates = require('./choose-blueprint-updates');

const {
  'to': { default: toDefault },
  'codemods-url': { default: codemodsUrlDefault }
} = require('./args');

const { formatBlueprintLine } = chooseBlueprintUpdates;

module.exports = async function emberCliUpdate({
  blueprint: _blueprint,
  from,
  to = toDefault,
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
      let downloadedPackage = await downloadPackage(null, packageUrl, to);
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

      let {
        areAllUpToDate,
        blueprintUpdates,
        blueprint: _blueprint,
        to: _to
      } = await chooseBlueprintUpdates({
        cwd,
        emberCliUpdateJson
      });

      if (areAllUpToDate) {
        return `${blueprintUpdates.map(formatBlueprintLine).join(`
`)}

All blueprints are up-to-date!`;
      }

      blueprint = _blueprint;
      to = _to;
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

  let {
    baseBlueprint,
    defaultBlueprint
  } = await getBaseBlueprint({
    cwd,
    emberCliUpdateJson,
    blueprint
  });

  if (!baseBlueprint) {
    // for non-existing blueprints
    blueprint.isBaseBlueprint = true;
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
        if (packageUrl) {
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
          let versions = await getVersions(endBlueprint.packageName);
          let getTagVersion = _getTagVersion(versions, endBlueprint.packageName);
          endBlueprint.version = await getTagVersion(to);
        }
      } else {
        let packageName = getPackageName(projectOptions);
        let packageVersion = getPackageVersion(packageJson, packageName);

        let versions = await getVersions(packageName);

        let getTagVersion = _getTagVersion(versions, packageName);

        await Promise.all([
          (async() => {
            if (startBlueprint) {
              if (from) {
                startBlueprint.version = await getTagVersion(from);
              } else {
                startBlueprint.version = getProjectVersion(packageVersion, versions, projectOptions);
              }
            }
          })(),
          (async() => {
            endBlueprint.version = await getTagVersion(to);
          })()
        ]);
      }

      let customDiffOptions;
      if (createCustomDiff) {
        customDiffOptions = getStartAndEndCommands({
          packageJson,
          baseBlueprint,
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
    ignoredFiles: [await getBlueprintRelativeFilePath(cwd)],
    wasRunAsExecutable
  })).promise;

  if (_blueprint) {
    let emberCliUpdateJson = await loadBlueprintFile(cwd);

    // If you don't have a state file, save the default blueprint,
    // even if you are currently working on a custom blueprint.
    if (!emberCliUpdateJson || !isCustomBlueprint) {
      await saveBlueprint({
        cwd,
        blueprint: defaultBlueprint
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
