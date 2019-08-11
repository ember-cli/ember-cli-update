'use strict';

const path = require('path');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const npa = require('npm-package-arg');
const run = require('./run');

async function downloadBlueprint(name, url, range) {
  if (!range) {
    url = name;
  } else if (!url) {
    url = `${name}@${range}`;
  } else {
    url += `#semver:${range}`;
  }
  let newTmpDir = await tmpDir();
  let output = await run(`npm install ${url}`, { cwd: newTmpDir });
  // if (!name) {
  //   name = output.match(/^\+ (.*)@\d\.\d\.\d.*$/m)[1];
  // }
  let arg = output.match(/^\+ (.*)$/m)[1];
  let parsed = npa(arg);
  name = parsed.name;
  let version = parsed.rawSpec;
  let _path = path.join(newTmpDir, 'node_modules', name);
  // let version = require(path.join(_path, 'package')).version;
  return {
    name,
    path: _path,
    version
  };
}

module.exports = downloadBlueprint;
