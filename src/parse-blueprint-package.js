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

// https://stackoverflow.com/a/45242825/1703845
function isSubDir(base, test) {
  let relative = path.relative(base, test);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

async function parseBlueprintPackage({
  cwd = '.',
  blueprint
}) {
  let name;
  let location;
  let url;
  let blueprintPath = path.resolve(cwd, blueprint);
  if (await fs.pathExists(blueprintPath) && !isSubDir(cwd, blueprintPath)) {
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
