'use strict';

const fs = require('fs-extra');
const path = require('path');

async function getBlueprintFilePath(cwd) {
  let configDir = 'config';

  try {
    let packageJson = await fs.readJson(path.join(cwd, 'package.json'));

    if (packageJson['ember-addon'] && packageJson['ember-addon'].configPath) {
      configDir = packageJson['ember-addon'].configPath;
    }
  } catch (err) {}

  return path.join(cwd, configDir, 'ember-cli-update.json');
}

module.exports = getBlueprintFilePath;
