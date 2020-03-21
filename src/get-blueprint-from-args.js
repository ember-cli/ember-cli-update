'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const resolvePackage = require('./resolve-package');
const findBlueprint = require('./find-blueprint');
const { defaultTo } = require('./constants');
const normalizeBlueprintArgs = require('./normalize-blueprint-args');

async function getBlueprintFromArgs({
  cwd,
  emberCliUpdateJson,
  packageName,
  blueprint,
  to = defaultTo
}) {
  let blueprintArgs = normalizeBlueprintArgs({
    packageName,
    blueprintName: blueprint
  });

  let parsedPackage = await parseBlueprintPackage({
    cwd,
    packageName: blueprintArgs.packageName
  });
  let url = parsedPackage.url;

  let packageInfo = await resolvePackage({
    name: parsedPackage.name,
    url,
    range: to
  });

  packageName = packageInfo.name;
  let blueprintName;
  if (blueprintArgs.blueprintName !== blueprintArgs.packageName) {
    blueprintName = blueprintArgs.blueprintName;
  } else {
    blueprintName = packageName;
  }

  let existingBlueprint = findBlueprint(emberCliUpdateJson, packageName, blueprintName);
  if (!existingBlueprint) {
    throw `blueprint "${blueprint}" was not found`;
  }

  return {
    packageInfo,
    existingBlueprint
  };
}

module.exports = getBlueprintFromArgs;
