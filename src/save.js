'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const loadSafeBlueprint = require('./load-safe-blueprint');
const saveBlueprint = require('./save-blueprint');
const loadBlueprintFile = require('./load-blueprint-file');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const resolvePackage = require('./resolve-package');
const normalizeBlueprintArgs = require('./normalize-blueprint-args');

module.exports = async function save({
  cwd = process.cwd(),
  packageName,
  blueprint: _blueprint,
  from,
  outputRepo,
  codemodsSource,
  blueprintOptions
}) {
  if (!from) {
    throw 'A custom blueprint cannot detect --from. You must supply it.';
  }

  // A custom config location in package.json may be reset/init away,
  // so we can no longer look it up on the fly after the run.
  // We must rely on a lookup before the run.
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let blueprintArgs = normalizeBlueprintArgs({
    packageName,
    blueprintName: _blueprint
  });

  let parsedPackage = await parseBlueprintPackage({
    cwd,
    packageName: blueprintArgs.packageName
  });

  let packageInfo = await resolvePackage({
    name: parsedPackage.name,
    url: parsedPackage.url,
    range: from
  });

  packageName = packageInfo.name;
  let blueprintName;
  if (blueprintArgs.blueprintName !== blueprintArgs.packageName) {
    blueprintName = blueprintArgs.blueprintName;
  } else {
    blueprintName = packageName;
  }

  let blueprint = loadSafeBlueprint({
    packageName,
    name: blueprintName,
    location: parsedPackage.location,
    version: packageInfo.version,
    options: blueprintOptions
  });

  if (!(await loadBlueprintFile(emberCliUpdateJsonPath))) {
    blueprint.isBaseBlueprint = true;
  }

  if (outputRepo) {
    blueprint.outputRepo = outputRepo;
  }
  if (codemodsSource) {
    blueprint.codemodsSource = codemodsSource;
  }

  await saveBlueprint({
    emberCliUpdateJsonPath,
    blueprint
  });
};
