'use strict';

const utils = require('./utils');
const parseBlueprint = require('./parse-blueprint');
const downloadBlueprint = require('./download-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadBlueprintFile = require('./load-blueprint-file');
const saveDefaultBlueprint = require('./save-default-blueprint');

const toDefault = require('./args').to.default;

module.exports = async function install({
  addon
}) {
  let defaultBlueprint = {
    name: 'ember-cli'
  };

  let cwd = process.cwd();

  await utils.npx(`--no-install ember install ${addon}`);

  // This can be optimized by going into the node_modules install location
  // from above and grabbing it from there.
  let parsedBlueprint = await parseBlueprint(addon);
  let blueprint = await downloadBlueprint(parsedBlueprint.name, parsedBlueprint.url, toDefault);

  let isCustomBlueprint = blueprint.name !== defaultBlueprint.name;

  let emberCliUpdateJson = await loadBlueprintFile(cwd);

  if (!emberCliUpdateJson && isCustomBlueprint) {
    await saveDefaultBlueprint({
      cwd,
      blueprint: defaultBlueprint
    });
  }

  await saveBlueprint({
    cwd,
    name: blueprint.name,
    location: parsedBlueprint.location,
    version: blueprint.version
    // isPartial: true
  });
};
