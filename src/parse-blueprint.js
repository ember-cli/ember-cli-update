'use strict';

const path = require('path');
let { URL } = require('url');
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

async function parseBlueprint(blueprint) {
  let name;
  let url;
  let blueprintPath = path.resolve(process.cwd(), blueprint);
  if (await fs.pathExists(blueprintPath)) {
    let posixBlueprintPath = toPosixAbsolutePath(blueprintPath);
    url = `git+file://${posixBlueprintPath}`;
  } else {
    try {
      // This matches Window's paths, so it can't be done first.
      new URL(blueprint);
      url = blueprint;
    } catch (err) {
      name = blueprint;
    }
  }
  return {
    name,
    url
  };
}

module.exports = parseBlueprint;
module.exports.toPosixAbsolutePath = toPosixAbsolutePath;
