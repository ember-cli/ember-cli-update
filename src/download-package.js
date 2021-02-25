'use strict';

const path = require('path');
const { createTmpDir } = require('./tmp');
const npa = require('npm-package-arg');
const { spawn } = require('./run');

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
  let { stdout } = await spawn('npm', ['install', url], { cwd: newTmpDir });
  // if (!name) {
  //   name = stdout.match(/^\+ (.*)@\d\.\d\.\d.*$/m)[1];
  // }
  let arg = stdout.match(/^\+ (.*)$/m)[1];
  let parsed = npa(arg);
  name = parsed.name;
  let version = parsed.rawSpec;
  let _path = path.join(newTmpDir, 'node_modules', name);

  return {
    name,
    path: _path,
    version
  };
}

module.exports = downloadPackage;
