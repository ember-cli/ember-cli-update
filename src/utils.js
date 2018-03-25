'use strict';

const path = require('path');
const execa = require('execa');

module.exports.run = require('./run');
module.exports.opn = require('opn');

module.exports.runEmberModulesCodemod = function runEmberModulesCodemod() {
  return execa('npx', ['ember-modules-codemod'], {
    localDir: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
};
