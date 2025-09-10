'use strict';

const fs = require('fs-extra');

async function loadBlueprintFile(emberCliUpdateJsonPath) {
  try {
    let emberCliUpdateJson = await fs.readJson(emberCliUpdateJsonPath);
    return emberCliUpdateJson;
  } catch {
    // do nothing
  }
}

module.exports = loadBlueprintFile;
