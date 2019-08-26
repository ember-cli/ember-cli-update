'use strict';

const fs = require('fs-extra');
const path = require('path');

async function saveBlueprintFile(cwd, emberCliUpdateJson) {
  let emberCliUpdateJsonPath = path.join(cwd, 'ember-cli-update.json');

  await fs.writeJson(emberCliUpdateJsonPath, emberCliUpdateJson, {
    spaces: 2,
    EOL: require('os').EOL
  });
}

module.exports = saveBlueprintFile;
