'use strict';

const install = require('../../src/install');

module.exports.command = 'install <addon>';

module.exports.describe = 'install an addon';

module.exports.handler = async function handler(argv) {
  try {
    await install(argv);
  } catch (err) {
    console.error(err);
  }
};
