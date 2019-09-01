'use strict';

const loadBlueprintFile = require('./load-blueprint-file');

async function loadSafeBlueprintFile(cwd) {
  let emberCliUpdateJson = await loadBlueprintFile(cwd);

  if (!emberCliUpdateJson) {
    emberCliUpdateJson = {
      schemaVersion: '0',
      blueprints: []
    };
  }

  if (!emberCliUpdateJson.blueprints) {
    emberCliUpdateJson.blueprints = [];
  }

  return emberCliUpdateJson;
}

module.exports = loadSafeBlueprintFile;
