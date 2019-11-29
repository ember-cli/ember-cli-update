'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadBlueprintFile = require('./load-blueprint-file');
const bootstrap = require('./bootstrap');

module.exports = async function save({
  blueprint: _blueprint,
  from,
  blueprintOptions
}) {
  if (!from) {
    throw new Error('A custom blueprint cannot detect --from. You must supply it.');
  }

  let cwd = process.cwd();

  let parsedPackage = await parseBlueprintPackage({
    cwd,
    blueprint: _blueprint
  });

  let downloadedPackage = await downloadPackage(parsedPackage.name, parsedPackage.url, from);

  let blueprint = loadSafeBlueprint({
    packageName: downloadedPackage.name,
    name: downloadedPackage.name,
    location: parsedPackage.location,
    version: downloadedPackage.version,
    options: blueprintOptions
  });

  if (!await loadBlueprintFile(cwd)) {
    await bootstrap();
  }

  await saveBlueprint({
    cwd,
    blueprint
  });
};
