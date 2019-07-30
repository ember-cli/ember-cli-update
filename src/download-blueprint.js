'use strict';

const path = require('path');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const run = require('./run');

async function downloadBlueprint(name, url, range) {
  if (url) {
    url += `#semver:${range}`;
  } else {
    url = `${name}@${range}`;
  }
  let newTmpDir = await tmpDir();
  let output = await run(`npm install ${url}`, { cwd: newTmpDir });
  if (!name) {
    name = output.match(/^\+ (.*)@\d\.\d\.\d.*$/m)[1];
  }
  let _path = path.join(newTmpDir, 'node_modules', name);
  return {
    name,
    path: _path
  };
}

module.exports = downloadBlueprint;
