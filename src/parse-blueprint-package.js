'use strict';

const path = require('path');
const { URL } = require('url');
const fs = require('fs-extra');

function toPosixAbsolutePath(path) {
  let posixPath = path.replace(/\\/g, '/').replace(/^(.+):/, function () {
    return arguments[1].toLowerCase();
  });
  if (!posixPath.startsWith('/')) {
    posixPath = `/${posixPath}`;
  }
  return posixPath;
}

/**
 * Accommodate situations where `packageName` is a URL or path on local disk.
 *
 * @param {string} cwd - Check if path exists concatenated with `packageName` if that is a local path
 * @param {string} packageName - Can be local path (absolute or relative) or url
 * @returns {Promise<{name: string, location: string, url: string}>}
 */
async function parseBlueprintPackage({ cwd = '.', packageName }) {
  let name;
  let location;
  let url;
  let blueprintPath;

  if (packageName.startsWith('.')) {
    blueprintPath = path.resolve(cwd, packageName);
  } else if (
    path.isAbsolute(packageName) &&
    (await fs.pathExists(packageName))
  ) {
    blueprintPath = packageName;
  }

  if (blueprintPath) {
    let posixBlueprintPath = toPosixAbsolutePath(blueprintPath);
    url = `git+file://${posixBlueprintPath}`;
    location = packageName;
  } else {
    try {
      // This matches Window's paths, so it can't be done first.
      new URL(packageName);
      url = packageName;
      location = packageName;
    } catch {
      name = packageName;
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
