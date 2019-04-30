'use strict';

module.exports.run = require('./run');
module.exports.npx = require('boilerplate-update/src/npx');

module.exports.spawn = function spawn() {
  let ps = require('child_process').spawn(...arguments);

  return new Promise((resolve, reject) => {
    ps.on('error', reject);
    ps.on('exit', resolve);
  });
};
