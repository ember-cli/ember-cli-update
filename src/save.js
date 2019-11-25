'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const stageBlueprintFile = require('./stage-blueprint-file');

module.exports = async function save({
  blueprint: _blueprint,
  from
}) {
  let cwd = process.cwd();

  let parsedPackage = await parseBlueprintPackage(_blueprint);

  let downloadedPackage = await downloadPackage(parsedPackage.name, parsedPackage.url, from);

  let blueprint = loadSafeBlueprint({
    packageName: downloadedPackage.name,
    name: downloadedPackage.name,
    location: parsedPackage.location,
    version: downloadedPackage.version
  });

  await saveBlueprint({
    cwd,
    blueprint
  });

  await stageBlueprintFile(cwd);
};
