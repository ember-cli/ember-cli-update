'use strict';

const { getBlueprintRelativeFilePath } = require('./get-blueprint-file-path');
const run = require('./run');

async function stageBlueprintFile(cwd) {
  let emberCliUpdateJsonPath = await getBlueprintRelativeFilePath(cwd);

  await run(`git add ${emberCliUpdateJsonPath}`);
}

module.exports = stageBlueprintFile;
