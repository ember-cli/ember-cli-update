'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadBlueprintFile = require('./load-blueprint-file');
const bootstrap = require('./bootstrap');
const emberInstallAddon = require('./ember-install-addon');
const getVersions = require('boilerplate-update/src/get-versions');
const _getTagVersion = require('./get-tag-version');
const getBlueprintFilePath = require('./get-blueprint-file-path');

const toDefault = require('./args').to.default;

module.exports = async function install({
  addon
}) {
  let cwd = process.cwd();

  // A custom config location in package.json may be reset/init away,
  // so we can no longer look it up on the fly after the run.
  // We must rely on a lookup before the run.
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let parsedPackage = await parseBlueprintPackage({
    cwd,
    blueprint: addon
  });

  let packageName;
  let version;
  let path;
  if (parsedPackage.location) {
    let downloadedPackage = await downloadPackage(null, parsedPackage.url, toDefault);
    packageName = downloadedPackage.name;
    version = downloadedPackage.version;
    path = downloadedPackage.path;
  } else {
    packageName = addon;
    let versions = await getVersions(packageName);
    let getTagVersion = _getTagVersion(versions, packageName);
    version = await getTagVersion(toDefault);
  }

  // We are double installing it, via the above and the below.
  // The above is needed to resolve the real package name
  // if location is specified, and the below is needed to allow
  // NPM/yarn to resolve the package.json version for us.
  // This may be able to be combined somehow...
  let { ps } = await emberInstallAddon({
    cwd,
    addonNameOverride: addon,
    packageName,
    blueprintPath: path
  });

  await ps;

  let blueprint = loadSafeBlueprint({
    packageName,
    name: packageName,
    location: parsedPackage.location,
    version
  });

  if (!await loadBlueprintFile(emberCliUpdateJsonPath)) {
    await bootstrap();
  }

  await saveBlueprint({
    emberCliUpdateJsonPath,
    blueprint
  });
};
