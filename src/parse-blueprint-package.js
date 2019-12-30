'use strict';

const path = require('path');
const { URL } = require('url');
const fs = require('fs-extra');

function toPosixAbsolutePath(path) {
  let posixPath = path.replace(/\\/g, '/').replace(/^(.+):/, function() {
    return arguments[1].toLowerCase();
  });
  if (!posixPath.startsWith('/')) {
    posixPath = `/${posixPath}`;
  }
  return posixPath;
}

async function parseBlueprintPackage({
  cwd = '.',
  blueprint
}) {
  let name;
  let location;
  let url;
  let blueprintPath;

  if (blueprint.startsWith('.')) {
    blueprintPath = path.resolve(cwd, blueprint);
  } else if (path.isAbsolute(blueprint) && await fs.pathExists(blueprint)) {
    blueprintPath = blueprint;
  }

  if (blueprintPath) {
    let posixBlueprintPath = toPosixAbsolutePath(blueprintPath);
    url = `git+file://${posixBlueprintPath}`;
    location = blueprint;
  } else {
    try {
      // This matches Window's paths, so it can't be done first.
      new URL(blueprint);
      url = blueprint;
      location = blueprint;
    } catch (err) {
      name = blueprint;
    }
  }

  return {
    name,
    location,
    url
  };
}

module.exports = parseBlueprintPackage;
module.exports.toPosixAbsolutePath = toPosixAbsolutePath;
