'use strict';

const path = require('path');
const execa = require('execa');
const debug = require('debug')('ember-cli-update');
const run = require('./run');

module.exports = function runCodemods() {
  debug('ember-modules-codemod');
  return execa('ember-modules-codemod', {
    localDir: path.join(__dirname, '..'),
    stdio: 'inherit'
  }).then(() => {
    run('git add -A');
  });
};
