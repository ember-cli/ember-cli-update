'use strict';

const downloadPackage = require('./download-package');
const getVersions = require('./get-versions');
const _getTagVersion = require('./get-tag-version');
const getBlueprintNameOverride = require('./get-default-blueprint-name-override');

/**
 * Read the contents from the package.json for the remote or local package
 *
 * @param {string} name - Name of the package
 * @param {string} url - URL to project such as `git+file:///xyz` or `xyz`
 * @param {string} range - Version string such as ^1.2.3 or 2.0.0
 * @returns {Promise<{path, name, version: *, defaultBlueprintOverride}>}
 */
async function resolvePackage({
  name,
  url,
  range
}) {
  let version;
  let path;
  let defaultBlueprintOverride;

  if (url) {
    let downloadedPackage = await downloadPackage(name, url, range);
    name = downloadedPackage.name;
    version = downloadedPackage.version;
    path = downloadedPackage.path;
  } else {
    let versions = await getVersions(name);
    let getTagVersion = _getTagVersion(versions, name);
    version = await getTagVersion(range);
    defaultBlueprintOverride = module.exports.getBlueprintNameOverride(name);
  }

  return {
    name,
    version,
    path,
    defaultBlueprintOverride
  };
}

module.exports = resolvePackage;
module.exports.getBlueprintNameOverride = getBlueprintNameOverride;
