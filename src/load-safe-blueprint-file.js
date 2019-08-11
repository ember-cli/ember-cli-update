'use strict';

const loadBlueprintFile = require('./load-blueprint-file');

async function loadSafeBlueprintFile(cwd) {
  let emberCliUpdateJson = await loadBlueprintFile(cwd);

  if (!emberCliUpdateJson) {
    emberCliUpdateJson = {
      blueprints: []
    };
  }

  if (!emberCliUpdateJson.blueprints) {
    emberCliUpdateJson.blueprints = [];
  }

  return emberCliUpdateJson;
}

module.exports = loadSafeBlueprintFile;
