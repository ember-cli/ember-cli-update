'use strict';

const fs = require('fs-extra');
const path = require('path');

async function getBlueprintFilePath(cwd) {
  let relative = await getBlueprintRelativeFilePath(cwd);

  return path.join(cwd, relative);
}

async function getBlueprintRelativeFilePath(cwd) {
  let configDir = 'config';

  try {
    let packageJson = await fs.readJson(path.join(cwd, 'package.json'));

    if (packageJson['ember-addon'] && packageJson['ember-addon'].configPath) {
      configDir = packageJson['ember-addon'].configPath;
    }
  } catch (err) {}

  return path.join(configDir, 'ember-cli-update.json');
}

module.exports = getBlueprintFilePath;
module.exports.getBlueprintRelativeFilePath = getBlueprintRelativeFilePath;
