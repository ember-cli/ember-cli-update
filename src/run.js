'use strict';

const execa = require('execa');
const debug = require('./debug');

module.exports = async function run() {
  debug(...arguments);

  let { stdout } = await execa.command(...arguments);

  if (stdout) {
    debug(stdout);
  }

  return stdout;
};
