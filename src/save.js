'use strict';

const parseBlueprint = require('./parse-blueprint');
const downloadBlueprint = require('./download-blueprint');
const saveBlueprint = require('./save-blueprint');
const stageBlueprintFile = require('./stage-blueprint-file');

module.exports = async function save({
  blueprint,
  from
}) {
  let cwd = process.cwd();

  let parsedBlueprint = await parseBlueprint(blueprint);

  let downloadedBlueprint = await downloadBlueprint(parsedBlueprint.name, parsedBlueprint.url, from);

  await saveBlueprint({
    cwd,
    blueprint: {
      packageName: downloadedBlueprint.packageName,
      name: downloadedBlueprint.name,
      location: parsedBlueprint.location,
      version: downloadedBlueprint.version
    }
  });

  await stageBlueprintFile(cwd);
};
