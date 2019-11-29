'use strict';

const utils = require('./utils');
const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadBlueprintFile = require('./load-blueprint-file');
const bootstrap = require('./bootstrap');

const toDefault = require('./args').to.default;

module.exports = async function install({
  addon
}) {
  let cwd = process.cwd();

  await utils.npx(`--no-install ember install ${addon}`);

  // This can be optimized by going into the node_modules install location
  // from above and grabbing it from there.
  let parsedPackage = await parseBlueprintPackage({
    cwd,
    blueprint: addon
  });
  let downloadedPackage = await downloadPackage(parsedPackage.name, parsedPackage.url, toDefault);

  let blueprint = loadSafeBlueprint({
    packageName: downloadedPackage.name,
    name: downloadedPackage.name,
    location: parsedPackage.location,
    version: downloadedPackage.version
  });

  if (!await loadBlueprintFile(cwd)) {
    await bootstrap();
  }

  await saveBlueprint({
    cwd,
    blueprint
  });
};
