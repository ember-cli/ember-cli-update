'use strict';

const utils = require('./utils');
const parseBlueprint = require('./parse-blueprint');
const downloadPackage = require('./download-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadBlueprintFile = require('./load-blueprint-file');
const saveDefaultBlueprint = require('./save-default-blueprint');
const isDefaultBlueprint = require('./is-default-blueprint');

const toDefault = require('./args').to.default;

module.exports = async function install({
  addon
}) {
  let cwd = process.cwd();

  await utils.npx(`--no-install ember install ${addon}`);

  // This can be optimized by going into the node_modules install location
  // from above and grabbing it from there.
  let parsedBlueprint = await parseBlueprint(addon);
  let downloadedPackage = await downloadPackage(parsedBlueprint.name, parsedBlueprint.url, toDefault);

  let blueprint = loadSafeBlueprint({
    packageName: downloadedPackage.name,
    name: downloadedPackage.name,
    location: parsedBlueprint.location,
    version: downloadedPackage.version
  });

  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  let emberCliUpdateJson = await loadBlueprintFile(cwd);

  if (!emberCliUpdateJson && isCustomBlueprint) {
    await saveDefaultBlueprint({
      cwd
    });
  }

  await saveBlueprint({
    cwd,
    blueprint
  });
};
