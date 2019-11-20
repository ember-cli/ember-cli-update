'use strict';

const utils = require('./utils');
const findBlueprint = require('./find-blueprint');

async function saveBlueprint({
  cwd,
  packageName,
  name,
  type,
  location,
  version,
  options = [],
  isBaseBlueprint
}) {
  let emberCliUpdateJson = await utils.loadSafeBlueprintFile(cwd);

  let savedBlueprint = findBlueprint(emberCliUpdateJson, packageName, name);

  if (!savedBlueprint) {
    savedBlueprint = {
      packageName,
      name
    };

    if (type) {
      savedBlueprint.type = type;
    }

    if (location) {
      savedBlueprint.location = location;
    }

    savedBlueprint.version = version;

    if (isBaseBlueprint !== undefined) {
      savedBlueprint.isBaseBlueprint = isBaseBlueprint;
    }

    if (options.length) {
      savedBlueprint.options = options;
    }

    emberCliUpdateJson.blueprints.push(savedBlueprint);
  } else {
    savedBlueprint.version = version;
  }

  await utils.saveBlueprintFile(cwd, emberCliUpdateJson);
}

module.exports = saveBlueprint;
