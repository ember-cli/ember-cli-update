'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const downloadPackage = require('./download-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadBlueprintFile = require('./load-blueprint-file');
const bootstrap = require('./bootstrap');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const getVersions = require('boilerplate-update/src/get-versions');
const _getTagVersion = require('./get-tag-version');

module.exports = async function save({
  blueprint: _blueprint,
  from,
  blueprintOptions
}) {
  if (!from) {
    throw new Error('A custom blueprint cannot detect --from. You must supply it.');
  }

  let cwd = process.cwd();

  // A custom config location in package.json may be reset/init away,
  // so we can no longer look it up on the fly after the run.
  // We must rely on a lookup before the run.
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let parsedPackage = await parseBlueprintPackage({
    cwd,
    blueprint: _blueprint
  });

  let packageName;
  let version;

  if (parsedPackage.location) {
    let downloadedPackage = await downloadPackage(null, parsedPackage.url, from);
    packageName = downloadedPackage.name;
    version = downloadedPackage.version;
  } else {
    packageName = _blueprint;
    let versions = await getVersions(packageName);
    let getTagVersion = _getTagVersion(versions, packageName);
    version = await getTagVersion(from);
  }

  let blueprint = loadSafeBlueprint({
    packageName,
    name: packageName,
    location: parsedPackage.location,
    version,
    options: blueprintOptions
  });

  if (!await loadBlueprintFile(emberCliUpdateJsonPath)) {
    await bootstrap();
  }

  await saveBlueprint({
    emberCliUpdateJsonPath,
    blueprint
  });
};
