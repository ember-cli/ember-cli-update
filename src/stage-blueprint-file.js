'use strict';

const getBlueprintFilePath = require('./get-blueprint-file-path');
const run = require('./run');

async function stageBlueprintFile(cwd) {
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  await run(`git add ${emberCliUpdateJsonPath}`);
}

module.exports = stageBlueprintFile;
