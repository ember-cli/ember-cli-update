'use strict';

const saveBlueprint = require('./save-blueprint');
const loadDefaultBlueprintFromDisk = require('./load-default-blueprint-from-disk');
const getBlueprintFilePath = require('./get-blueprint-file-path');

module.exports = async function bootstrap({
  cwd = process.cwd()
} = {}) {
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let blueprint = await loadDefaultBlueprintFromDisk({ cwd });

  await saveBlueprint({
    emberCliUpdateJsonPath,
    blueprint
  });
};
