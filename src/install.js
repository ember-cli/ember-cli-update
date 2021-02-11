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
    path,
    defaultBlueprintOverride
  } = await resolvePackage({
    name: addon,
    url: parsedPackage.url,
    range: defaultTo
  });

  // We are double installing it, via the above and the below.
  // The above is needed to resolve the real package name
  // if location is specified, and the below is needed to allow
  // NPM/yarn to resolve the package.json version for us.
  // This may be able to be combined somehow...
  let { ps } = await installAndGenerateBlueprint({
    cwd,
    addonNameOverride: addon,
    packageName,
    blueprintName: _blueprintName || defaultBlueprintOverride || packageName,
    blueprintPath: path,
    packageManager: isYarnProject ? 'yarn' : 'npm'
  });

  await ps;

  let blueprint = loadSafeBlueprint({
    packageName,
    name: _blueprintName || packageName,
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
