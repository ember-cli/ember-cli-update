'use strict';

const downloadPackage = require('./download-package');
const getVersions = require('./get-versions');
const _getTagVersion = require('./get-tag-version');

async function resolvePackage({
  name,
  url,
  range
}) {
  let version;
  let path;

  if (url) {
    let downloadedPackage = await downloadPackage(name, url, range);
    name = downloadedPackage.name;
    version = downloadedPackage.version;
    path = downloadedPackage.path;
  } else {
    let versions = await getVersions(name);
    let getTagVersion = _getTagVersion(versions, name);
    version = await getTagVersion(range);
  }

  return {
    name,
    version,
    path
  };
}

module.exports = resolvePackage;
