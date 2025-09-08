'use strict';

const loadBlueprintFile = require('./load-blueprint-file');
const loadSafeBlueprint = require('./load-safe-blueprint');
const semver = require('semver');

const currentSchemaVersion = '1.0.0';

/**
 * Iterate through the `packages` attribute of the `ember-cli-update.json` file and ensure each
 * configuration has an `options` attribute
 *
 * `emberCliUpdateJson.blueprints` is expected to have at least the following attributes:
 * {
 *   packageName: 'package name',
 *   location: 'Path on disk if local',
 *   version: '1.2.3',
 *   options: [],
 *   ... Any other values
 * }
 *
 * @param {String} emberCliUpdateJsonPath - Path to `ember-cli-update.json` file
 * @returns {Promise<*>} - Contains object with `blueprints` attribute that is an array
 */
async function loadSafeBlueprintFile(emberCliUpdateJsonPath) {
  let emberCliUpdateJson = await loadBlueprintFile(emberCliUpdateJsonPath);

  if (!emberCliUpdateJson) {
    emberCliUpdateJson = {};
  }

  if ('schemaVersion' in emberCliUpdateJson) {
    if (emberCliUpdateJson.schemaVersion === 0) {
      // if (semver.lt(emberCliUpdateJson.schemaVersion, currentSchemaVersion)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Updating schemaVersion from ${emberCliUpdateJson.schemaVersion} to ${currentSchemaVersion}.`
      );
    } else if (
      semver.gt(emberCliUpdateJson.schemaVersion, currentSchemaVersion)
    ) {
      throw new Error(
        `schemaVersion ${emberCliUpdateJson.schemaVersion} is unexpectedly newer than the current ${currentSchemaVersion}.`
      );
    }
  }

  emberCliUpdateJson.schemaVersion = currentSchemaVersion;

  if (!emberCliUpdateJson.packages) {
    emberCliUpdateJson.packages = [];
  }

  emberCliUpdateJson.blueprints = emberCliUpdateJson.packages.reduce(
    (blueprints, _package) => {
      for (let blueprint of _package.blueprints) {
        blueprint.packageName = _package.name;
        blueprint.location = _package.location;
        blueprint.version = _package.version;

        blueprint = loadSafeBlueprint(blueprint);

        blueprints.push(blueprint);
      }

      return blueprints;
    },
    []
  );

  delete emberCliUpdateJson.packages;

  return emberCliUpdateJson;
}

module.exports = loadSafeBlueprintFile;
