'use strict';

const utils = require('./utils');
const findBlueprint = require('./find-blueprint');
const {
  defaultPackageName,
  defaultAppBlueprintName,
  EMBER_LEGACY_BLUEPRINT_VERSION,
  CLASSIC_BUILD_APP_BLUEPRINT
} = require('./constants');
const semver = require('semver');

function addBlueprint(emberCliUpdateJson, blueprint) {
  emberCliUpdateJson.blueprints.push(blueprint);
}

async function saveBlueprint({ emberCliUpdateJsonPath, blueprint }) {
  if (!(blueprint && blueprint.version)) {
    blueprint = await utils.loadDefaultBlueprintFromDisk({
      cwd: emberCliUpdateJsonPath
    });
  }

  let {
    packageName,
    name,
    type,
    location,
    version,
    outputRepo,
    codemodsSource,
    options,
    isBaseBlueprint
  } = blueprint;

  let emberCliUpdateJson = await utils.loadSafeBlueprintFile(
    emberCliUpdateJsonPath
  );

  let savedBlueprint = findBlueprint(emberCliUpdateJson, packageName, name);

  if (!savedBlueprint) {
    savedBlueprint = {
      packageName,
      name
    };

    if (type) {
      savedBlueprint.type = type;
    }

    if (location) {
      savedBlueprint.location = location;
    }

    savedBlueprint.version = version;

    if (outputRepo) {
      savedBlueprint.outputRepo = outputRepo;
    }

    if (codemodsSource) {
      savedBlueprint.codemodsSource = codemodsSource;
    }

    if (isBaseBlueprint !== undefined) {
      savedBlueprint.isBaseBlueprint = isBaseBlueprint;
    }

    savedBlueprint.options = options;

    addBlueprint(emberCliUpdateJson, savedBlueprint);
  } else {
    savedBlueprint.version = version;
  }

  if (
    savedBlueprint.isBaseBlueprint &&
    packageName === defaultPackageName &&
    name === defaultAppBlueprintName &&
    semver.gte(version, EMBER_LEGACY_BLUEPRINT_VERSION)
  ) {
    savedBlueprint.name = CLASSIC_BUILD_APP_BLUEPRINT;
    delete savedBlueprint.packageName;
    delete savedBlueprint.location;
    delete savedBlueprint.codemodsSource;
    delete savedBlueprint.outputRepo;
  }

  await utils.saveBlueprintFile(emberCliUpdateJsonPath, emberCliUpdateJson);
}

module.exports = saveBlueprint;
