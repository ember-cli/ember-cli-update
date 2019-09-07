'use strict';

const fs = require('fs-extra');
const getBlueprintFilePath = require('./get-blueprint-file-path');

async function loadBlueprintFile(cwd) {
  try {
    return await fs.readJson(await getBlueprintFilePath(cwd));
  } catch (err) {}
}

module.exports = loadBlueprintFile;
