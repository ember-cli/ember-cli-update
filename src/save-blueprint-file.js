'use strict';

const fs = require('fs-extra');
const path = require('path');
const getBlueprintFilePath = require('./get-blueprint-file-path');

async function saveBlueprintFile(cwd, emberCliUpdateJson) {
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  await fs.ensureDir(path.dirname(emberCliUpdateJsonPath));

  await fs.writeJson(emberCliUpdateJsonPath, emberCliUpdateJson, {
    spaces: 2,
    EOL: require('os').EOL
  });
}

module.exports = saveBlueprintFile;
