'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadDefaultBlueprintFromDisk = require('./load-default-blueprint-from-disk');
const loadSafeBlueprint = require('./load-safe-blueprint');
const isDefaultBlueprint = require('./is-default-blueprint');

async function getBaseBlueprint({
  cwd,
  emberCliUpdateJson,
  blueprint
}) {
  let baseBlueprint;
  let defaultBlueprint;

  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  if (isCustomBlueprint && !blueprint.isBaseBlueprint) {
    baseBlueprint = emberCliUpdateJson.blueprints.find(b => b.isBaseBlueprint);
    if (baseBlueprint) {
      baseBlueprint = loadSafeBlueprint(baseBlueprint);
      let isCustomBlueprint = !isDefaultBlueprint(baseBlueprint);
      if (isCustomBlueprint) {
        let url;
        if (baseBlueprint.location) {
          let parsedPackage = await parseBlueprintPackage({
            cwd,
            blueprint: baseBlueprint
          });
          url = parsedPackage.url;
        }
        let downloadedPackage = await downloadPackage(baseBlueprint.packageName, url, baseBlueprint.version);
        baseBlueprint.path = downloadedPackage.path;
      }
    } else {
      defaultBlueprint = await loadDefaultBlueprintFromDisk(cwd);
      baseBlueprint = defaultBlueprint;
    }
  }

  return {
    baseBlueprint,
    defaultBlueprint
  };
}

module.exports = getBaseBlueprint;
