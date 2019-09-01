'use strict';

const fs = require('fs-extra');
const path = require('path');

async function saveBlueprintFile(cwd, emberCliUpdateJson) {
  let configDir = path.join(cwd, 'config');

  await fs.ensureDir(configDir);

  let emberCliUpdateJsonPath = path.join(configDir, 'ember-cli-update.json');

  await fs.writeJson(emberCliUpdateJsonPath, emberCliUpdateJson, {
    spaces: 2,
    EOL: require('os').EOL
  });
}

module.exports = saveBlueprintFile;
