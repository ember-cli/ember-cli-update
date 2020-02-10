'use strict';

const parseBlueprintPackage = require('./parse-blueprint-package');
const resolvePackage = require('./resolve-package');
const findBlueprint = require('./find-blueprint');
const { defaultTo } = require('./constants');

async function getBlueprintFromArgs({
  cwd,
  emberCliUpdateJson,
  blueprint,
  to = defaultTo
}) {
  let parsedPackage = await parseBlueprintPackage({
    cwd,
    blueprint
  });
  let url = parsedPackage.url;

  let packageInfo = await resolvePackage({
    name: parsedPackage.name,
    url,
    range: to
  });

  let packageName = packageInfo.name;
  let name = packageInfo.name;

  let existingBlueprint = findBlueprint(emberCliUpdateJson, packageName, name);
  if (!existingBlueprint) {
    throw `blueprint "${blueprint}" was not found`;
  }

  return {
    packageInfo,
    existingBlueprint
  };
}

module.exports = getBlueprintFromArgs;
