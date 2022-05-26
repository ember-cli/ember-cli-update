'use strict';

const path = require('path');
const { createTmpDir } = require('./tmp');
const pacote = require('pacote');
const fs = { ...require('fs'), ...require('fs').promises };

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

  /* let { from, resolved, integrity } = */await pacote.extract(url, newTmpDir);

  let { version, ...pkg } = require(path.join(newTmpDir, 'package'));
  name = pkg.name;

  let namedDir = path.join(await createTmpDir(), name);

  await fs.mkdir(path.dirname(namedDir), { recursive: true });

  await fs.rename(newTmpDir, namedDir);

  return {
    name,
    path: namedDir,
    version
  };
}

module.exports = downloadPackage;
