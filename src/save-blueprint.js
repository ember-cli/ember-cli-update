'use strict';

const fs = require('fs-extra');
const path = require('path');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');

async function saveBlueprint({
  cwd,
  name,
  location,
  version,
  isPartial
}) {
  let emberCliUpdateJson = await loadSafeBlueprintFile(cwd);

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

  let emberCliUpdateJsonPath = path.join(cwd, 'ember-cli-update.json');

  await fs.writeJson(emberCliUpdateJsonPath, emberCliUpdateJson, {
    spaces: 2,
    EOL: require('os').EOL
  });
}

module.exports = saveBlueprint;
