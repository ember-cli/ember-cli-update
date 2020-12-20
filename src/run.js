'use strict';

const execa = require('execa');
const debug = require('./debug');

function spawn(bin, args = [], options) {
  debug(bin, ...args.map(arg => `"${arg}"`), options);

  let ps = execa(...arguments);

  ps.stdout.on('data', data => {
    debug(data.toString());
  });

  return ps;
}

module.exports = {
  spawn
};
