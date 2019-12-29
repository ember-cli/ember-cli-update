'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadBlueprintFile = require('./load-blueprint-file');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const resolvePackage = require('./resolve-package');

module.exports = async function save({
  blueprint: _blueprint,
  from,
  blueprintOptions
}) {
  if (!from) {
    throw new Error('A custom blueprint cannot detect --from. You must supply it.');
  }

  let cwd = process.cwd();

  // A custom config location in package.json may be reset/init away,
  // so we can no longer look it up on the fly after the run.
  // We must rely on a lookup before the run.
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let parsedPackage = await parseBlueprintPackage({
    cwd,
    blueprint: _blueprint
  });

  let {
    name: packageName,
    version
  } = await resolvePackage({
    name: _blueprint,
    url: parsedPackage.url,
    range: from
  });

  let blueprint = loadSafeBlueprint({
    packageName,
    name: packageName,
    location: parsedPackage.location,
    version,
    options: blueprintOptions
  });

  if (!await loadBlueprintFile(emberCliUpdateJsonPath)) {
    blueprint.isBaseBlueprint = true;
  }

  await saveBlueprint({
    emberCliUpdateJsonPath,
    blueprint
  });
};
