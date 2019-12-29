'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const isDefaultBlueprint = require('./is-default-blueprint');

async function getBaseBlueprint({
  cwd,
  emberCliUpdateJson,
  blueprint
}) {
  let baseBlueprint;

  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  if (isCustomBlueprint && !blueprint.isBaseBlueprint) {
    baseBlueprint = emberCliUpdateJson.blueprints.find(b => b.isBaseBlueprint);
    if (baseBlueprint) {
      baseBlueprint = loadSafeBlueprint(baseBlueprint);
      let isCustomBlueprint = !isDefaultBlueprint(baseBlueprint);
      if (isCustomBlueprint) {
        if (baseBlueprint.location) {
          let parsedPackage = await parseBlueprintPackage({
            cwd,
            blueprint: baseBlueprint
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
