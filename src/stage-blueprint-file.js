'use strict';

const path = require('path');
const { spawn } = require('./run');

async function stageBlueprintFile({ cwd, emberCliUpdateJsonPath }) {
  let relative = path.relative(cwd, emberCliUpdateJsonPath);

  await spawn('git', ['add', relative], {
    cwd
  });
}

module.exports = stageBlueprintFile;
