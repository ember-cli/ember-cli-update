'use strict';

const loadBlueprintFile = require('./load-blueprint-file');

async function loadSafeBlueprintFile(emberCliUpdateJsonPath) {
  let emberCliUpdateJson = await loadBlueprintFile(emberCliUpdateJsonPath);

  if (!emberCliUpdateJson) {
    emberCliUpdateJson = {};
  }

  emberCliUpdateJson.schemaVersion = 0;

  if (!emberCliUpdateJson.packages) {
    emberCliUpdateJson.packages = [];
  }

  emberCliUpdateJson.blueprints = emberCliUpdateJson.packages.reduce((blueprints, _package) => {
    for (let blueprint of _package.blueprints) {
      blueprint.packageName = _package.name;
      blueprint.location = _package.location;
      blueprint.version = _package.version;

      blueprints.push(blueprint);
    }

    return blueprints;
  }, []);

  delete emberCliUpdateJson.packages;

  return emberCliUpdateJson;
}

module.exports = loadSafeBlueprintFile;
