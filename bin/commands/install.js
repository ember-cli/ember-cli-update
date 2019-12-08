'use strict';

const args = require('../../src/args');
const install = require('../../src/install');

module.exports.command = 'install <addon>';

module.exports.describe = 'install an addon';

module.exports.builder = {
  to: args['to']
};

module.exports.handler = async function handler(argv) {
  let addon = argv['addon'];
  let to = argv['to'];

  try {
    await install({
      addon,
      to
    });
  } catch (err) {
    console.error(err);
  }
};
