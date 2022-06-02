'use strict';

const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getVersions = require('boilerplate-update/src/get-versions');
const _getTagVersion = require('./get-tag-version');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const saveBlueprint = require('./save-blueprint');
const loadDefaultBlueprintFromDisk = require('./load-default-blueprint-from-disk');
const loadSafeBlueprint = require('./load-safe-blueprint');
const stageBlueprintFile = require('./stage-blueprint-file');
const { getBlueprintRelativeFilePath } = require('./get-blueprint-file-path');
const isDefaultBlueprint = require('./is-default-blueprint');
const findBlueprint = require('./find-blueprint');
const getBaseBlueprint = require('./get-base-blueprint');
const chooseBlueprintUpdates = require('./choose-blueprint-updates');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const resolvePackage = require('./resolve-package');
const { defaultTo } = require('./constants');
const normalizeBlueprintArgs = require('./normalize-blueprint-args');

/**
 * If `version` attribute exists in the `blueprint` object and URL is empty, skip. Otherwise resolve the details of
 * the blueprint
 *
 * @param {Object} blueprint - Expected to contain `name`, `options` array, `packageName`, `location`, and `version`
 * attributes
 * @param {String} url - Optional parameter that links to package
 * @param {String} range - Version range i.e. 1.0.2
 * @returns {Promise<void>}
 * @private
 */
async function _resolvePackage(blueprint, url, range) {
  if (blueprint.version && !url) {
    return;
  }

  let {
    version,
    path
  } = await resolvePackage({
    name: blueprint.packageName,
    url,
    range
  });

  blueprint.version = version;

  if (path) {
    blueprint.path = path;
  }
}

module.exports = async function emberCliUpdate({
  cwd = process.cwd(),
  packageName,
  blueprint: _blueprint,
  from,
  to,
  resolveConflicts
} = {}) {
  // A custom config location in package.json may be reset/init away,
  // so we can no longer look it up on the fly after the run.
  // We must rely on a lookup before the run.
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let emberCliUpdateJson = await loadSafeBlueprintFile(emberCliUpdateJsonPath);

  let { blueprints } = emberCliUpdateJson;

  let blueprint;
  let packageUrl;

  if (_blueprint) {
    let blueprintArgs = normalizeBlueprintArgs({
      packageName,
      blueprintName: _blueprint
    });

    let parsedPackage = await parseBlueprintPackage({
      cwd,
      packageName: blueprintArgs.packageName
    });
    packageUrl = parsedPackage.url;

    packageName = parsedPackage.name;
    if (!packageName) {
      let downloadedPackage = await downloadPackage(null, packageUrl, defaultTo);
      packageName = downloadedPackage.name;
    }
    let blueprintName;
    if (blueprintArgs.blueprintName !== blueprintArgs.packageName) {
      blueprintName = blueprintArgs.blueprintName;
    } else {
      blueprintName = packageName;
    }

    let existingBlueprint = findBlueprint(emberCliUpdateJson, packageName, blueprintName);
    if (existingBlueprint) {
      blueprint = existingBlueprint;
    } else {
      blueprint = loadSafeBlueprint({
        packageName,
        name: blueprintName,
        location: parsedPackage.location
      });

      if (isDefaultBlueprint(blueprint)) {
        blueprint = await loadDefaultBlueprintFromDisk({
          cwd,
          version: from
        });
      }
    }

    if (from) {
      blueprint.version = from;
    }

    if (!blueprint.version) {
      throw new Error('A custom blueprint cannot detect --from. You must supply it.');
    }
  } else if (blueprints.length) {
    let {
      areAllUpToDate,
      blueprint: _blueprint,
      to: _to
    } = await chooseBlueprintUpdates({
      cwd,
      emberCliUpdateJson,
      to
    });

    if (areAllUpToDate) {
      return { promise: Promise.resolve() };
    }

    blueprint = _blueprint;
    to = _to;
  } else {
    blueprint = await loadDefaultBlueprintFromDisk({
      cwd,
      version: from
    });
  }

  // If blueprint is located on disk
  if (blueprint.location && !packageUrl) {
    let parsedPackage = await parseBlueprintPackage({
      cwd,
      packageName: blueprint.location
    });
    packageUrl = parsedPackage.url;
  }

  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  let baseBlueprint = await getBaseBlueprint({
    cwd,
    blueprints,
    blueprint
  });

  // If no base blueprint is found, set the selected one as the base blueprint.
  // `glimmer`, `app`, and `addon` blueprints as well as ones whose `isBaseBlueprint` attribute is
  // set to true will also have baseBlueprint undefined
  if (!baseBlueprint) {
    // for non-existing blueprints
    blueprint.isBaseBlueprint = true;
  }

  if (typeof to !== 'string') {
    to = defaultTo;
  }

  if (resolveConflicts) {
    // eslint-disable-next-line no-console
    console.warn('`--resolve-conflicts` is deprecated. Please run `git mergetool` manually.');
  }

  let endBlueprint;

  let {
    promise,
    resolveConflictsProcess
  } = await boilerplateUpdate({
    cwd,
    projectOptions: ({ packageJson }) => getProjectOptions(packageJson, blueprint),
    mergeOptions: async function mergeOptions({
      packageJson,
      projectOptions
    }) {
      let startBlueprint = { ...blueprint };
      endBlueprint = { ...blueprint };
      delete endBlueprint.version;

      if (isCustomBlueprint) {
        await Promise.all([
          _resolvePackage(startBlueprint, packageUrl, startBlueprint.version),
          _resolvePackage(endBlueprint, packageUrl, to)
        ]);
      } else {
        let packageName = getPackageName(projectOptions);
        let versions = await getVersions(packageName);
        let getTagVersion = _getTagVersion(versions, packageName);
        endBlueprint.version = await getTagVersion(to);
      }

      let customDiffOptions = getStartAndEndCommands({
        packageJson,
        baseBlueprint,
        startBlueprint,
        endBlueprint
      });

      return {
        startVersion: startBlueprint.version,
        endVersion: endBlueprint.version,
        customDiffOptions
      };
    },
    resolveConflicts,
    createCustomDiff: true,
    ignoredFiles: [await getBlueprintRelativeFilePath(cwd)]
  });

  return {
    promise: (async() => {
      let result = await promise;

      await saveBlueprint({
        emberCliUpdateJsonPath,
        blueprint: endBlueprint
      });

      await stageBlueprintFile({
        cwd,
        emberCliUpdateJsonPath
      });

      return result;
    })(),
    resolveConflictsProcess
  };
};
