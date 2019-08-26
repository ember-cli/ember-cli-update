'use strict';

module.exports.npx = require('boilerplate-update/src/npx');
module.exports.readdir = require('fs-extra').readdir;
module.exports.require = require;
module.exports.getVersions = require('boilerplate-update/src/get-versions');

module.exports.spawn = async function spawn() {
  let ps = require('child_process').spawn(...arguments);

  await new Promise((resolve, reject) => {
    ps.on('error', reject);
    ps.on('exit', resolve);
  });
};

module.exports.downloadBlueprint = require('./download-blueprint');
module.exports.loadSafeBlueprintFile = require('./load-safe-blueprint-file');
module.exports.saveBlueprint = require('./save-blueprint');
module.exports.saveBlueprintFile = require('./save-blueprint-file');
