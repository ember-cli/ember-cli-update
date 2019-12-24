'use strict';

const path = require('path');
const run = require('./run');

async function stageBlueprintFile({
  cwd,
  emberCliUpdateJsonPath
}) {
  let relative = path.relative(cwd, emberCliUpdateJsonPath);

  await run(`git add ${relative}`);
}

module.exports = stageBlueprintFile;
