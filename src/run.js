'use strict';

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const debug = require('./debug');

module.exports = async function run() {
  debug(...arguments);

  let { stdout } = await exec(...arguments);

  if (stdout) {
    debug(stdout);
  }

  return stdout;
};
