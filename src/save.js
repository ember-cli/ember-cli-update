'use strict';

const parseBlueprint = require('./parse-blueprint');
const downloadPackage = require('./download-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const stageBlueprintFile = require('./stage-blueprint-file');

module.exports = async function save({
  blueprint: _blueprint,
  from
}) {
  let cwd = process.cwd();

  let parsedBlueprint = await parseBlueprint(_blueprint);

  let downloadedPackage = await downloadPackage(parsedBlueprint.name, parsedBlueprint.url, from);

  let blueprint = loadSafeBlueprint({
    packageName: downloadedPackage.name,
    name: downloadedPackage.name,
    location: parsedBlueprint.location,
    version: downloadedPackage.version
  });

  await saveBlueprint({
    cwd,
    blueprint
  });

  await stageBlueprintFile(cwd);
};
