'use strict';

const path = require('path');
const execa = require('execa');
const debug = require('debug')('ember-cli-update');

module.exports = function npx(command) {
  debug(`npx ${command}`);
  return execa('npx', command.split(' '), {
    localDir: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
};
