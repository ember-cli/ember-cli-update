'use strict';

const path = require('path');
const { createTmpDir } = require('./tmp');
const pacote = require('pacote');
const { mkdir } = require('fs/promises');
const Arborist = require('@npmcli/arborist');

/**
 * Download the package in a temporary location and read the contents of the package.json
 *
 * @param {string} name - name of package
 * @param {string} url - URL to package
 * @param {string} range - Version range
 * @returns {Promise<{path: string, defaultBlueprintOverride, name, version: (*|string)}>}
 */
async function downloadPackage(name, url, range) {
  if (!range) {
    throw new Error('Missing a range when downloading blueprint');
  }

  if (!url) {
    url = `${name}@${range}`;
  } else {
    url += `#semver:${range}`;
  }

  let newTmpDir = await createTmpDir();

  let manifest = await pacote.manifest(url);

  let _path = path.join(newTmpDir, manifest.name);

  await mkdir(_path);

  await pacote.extract(url, _path, {
    Arborist
  });

  return {
    name: manifest.name,
    path: _path,
    version: manifest.version
  };
}

module.exports = downloadPackage;
