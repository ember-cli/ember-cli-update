'use strict';

const run = require('./run');
const parseBlueprint = require('./parse-blueprint');
const downloadBlueprint = require('./download-blueprint');
const saveBlueprint = require('./save-blueprint');

module.exports = async function save({
  blueprint,
  from
}) {
  let cwd = process.cwd();

  let parsedBlueprint = await parseBlueprint(blueprint);

  let downloadedBlueprint = await downloadBlueprint(parsedBlueprint.name, parsedBlueprint.url, from);

  await saveBlueprint({
    cwd,
    name: downloadedBlueprint.name,
    location: parsedBlueprint.location,
    version: downloadedBlueprint.version
  });

  await run('git add ember-cli-update.json');
};
