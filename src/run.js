'use strict';

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const debug = require('debug')('ember-cli-update');

module.exports = async function run(command, options) {
  debug(command);
  let result = (await exec(command, options)).toString();
  debug(result);
  return result;
};
