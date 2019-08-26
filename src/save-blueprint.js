'use strict';

const utils = require('./utils');

async function saveBlueprint({
  cwd,
  name,
  location,
  version,
  isPartial
}) {
  let emberCliUpdateJson = await utils.loadSafeBlueprintFile(cwd);

  let { blueprints } = emberCliUpdateJson;
  let savedBlueprint = blueprints.find(b => b.name === name);

  if (!savedBlueprint) {
    savedBlueprint = {
      name
    };

    if (location) {
      savedBlueprint.location = location;
    }

    savedBlueprint.version = version;

    if (isPartial) {
      savedBlueprint.isPartial = isPartial;
    }

    blueprints.push(savedBlueprint);
  } else {
    savedBlueprint.version = version;
  }

  await utils.saveBlueprintFile(cwd, emberCliUpdateJson);
}

module.exports = saveBlueprint;
