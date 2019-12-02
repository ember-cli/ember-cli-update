'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadBlueprintFile = require('./load-blueprint-file');
const bootstrap = require('./bootstrap');
const emberInstallAddon = require('./ember-install-addon');

const toDefault = require('./args').to.default;

module.exports = async function install({
  addon
}) {
  let cwd = process.cwd();

  let parsedPackage = await parseBlueprintPackage({
    cwd,
    blueprint: addon
  });

  let downloadedPackage = await downloadPackage(parsedPackage.name, parsedPackage.url, toDefault);

  // We are double installing it, via the above and the below.
  // The above is needed to resolve the real package name,
  // and the below is needed to allow NPM/yarn to resolve the
  // package.json version for us.
  // This may be able to be combined somehow...
  let { ps } = await emberInstallAddon({
    cwd,
    addonName: addon,
    blueprintPackageName: downloadedPackage.name
  });

  await ps;

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
