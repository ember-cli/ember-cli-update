'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const isDefaultBlueprint = require('./is-default-blueprint');

/**
 * If the passed in `blueprint` is not the base blueprint, find it. A base blueprint is either
 * an `addon`, `app`, or `glimmer` blueprint or has the `isBaseBlueprint` boolean set to true.
 *
 * @param cwd - Used in `parseBlueprintPackage` to read package.json and find a viable version and normalize url
 * if it exists
 * @param blueprints - Find the base blueprint in this array if the passed blueprint is not one
 * @param blueprint - Figure out if this is a base blueprint
 * @returns {Promise<*>}
 */
async function getBaseBlueprint({ cwd, blueprints, blueprint }) {
  let baseBlueprint;

  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  if (isCustomBlueprint && !blueprint.isBaseBlueprint) {
    baseBlueprint = blueprints.find(b => b.isBaseBlueprint);
    if (baseBlueprint) {
      baseBlueprint = loadSafeBlueprint(baseBlueprint);
      let isCustomBlueprint = !isDefaultBlueprint(baseBlueprint);
      if (isCustomBlueprint) {
        if (baseBlueprint.location) {
          let parsedPackage = await parseBlueprintPackage({
            cwd,
            packageName: baseBlueprint.location
          });
          let downloadedPackage = await downloadPackage(
            baseBlueprint.packageName,
            parsedPackage.url,
            baseBlueprint.version
          );
          baseBlueprint.path = downloadedPackage.path;
        }
      }
    }
  }

  return baseBlueprint;
}

module.exports = getBaseBlueprint;
