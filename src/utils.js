'use strict';

module.exports.npx = require('boilerplate-update/src/npx');

module.exports.spawn = async function spawn() {
  let ps = require('child_process').spawn(...arguments);

  await new Promise((resolve, reject) => {
    ps.on('error', reject);
    ps.on('exit', resolve);
  });
};

module.exports.downloadBlueprint = require('./download-blueprint');
