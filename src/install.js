'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadBlueprintFile = require('./load-blueprint-file');
const bootstrap = require('./bootstrap');
const installAndGenerateBlueprint = require('./install-and-generate-blueprint');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const resolvePackage = require('./resolve-package');
const { defaultTo } = require('./constants');
const hasYarn = require('./has-yarn');
const getBlueprintNameOverride = require('./get-default-blueprint-name-override');

module.exports = async function install({
  cwd = process.cwd(),
  addon,
  blueprint: _blueprintName
}) {
  let isYarnProject = await hasYarn(cwd);
  // A custom config location in package.json may be reset/init away,
  // so we can no longer look it up on the fly after the run.
  // We must rely on a lookup before the run.
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let parsedPackage = await parseBlueprintPackage({
    cwd,
    packageName: addon
  });

  let {
    name: packageName,
    version,
    path
  } = await resolvePackage({
    name: addon,
    url: parsedPackage.url,
    range: defaultTo
  });

  let defaultBlueprintOverride = await module.exports.getBlueprintNameOverride(addon, cwd);
  let blueprintName = _blueprintName || defaultBlueprintOverride || packageName;

  // We are double installing it, via the above and the below.
  // The above is needed to resolve the real package name
  // if location is specified, and the below is needed to allow
  // NPM/yarn to resolve the package.json version for us.
  // This may be able to be combined somehow...
  let { ps } = await installAndGenerateBlueprint({
    cwd,
    addonNameOverride: addon,
    packageName,
    blueprintName,
    blueprintPath: path,
    packageManager: isYarnProject ? 'yarn' : 'npm',
    blueprintOptions: []
  });

  await ps;

  let blueprint = loadSafeBlueprint({
    packageName,
    name: blueprintName,
    location: parsedPackage.location,
    version
  });

  if (!await loadBlueprintFile(emberCliUpdateJsonPath)) {
    await bootstrap({ cwd });
  }

  await saveBlueprint({
    emberCliUpdateJsonPath,
    blueprint
  });
};

module.exports.getBlueprintNameOverride = getBlueprintNameOverride;
