'use strict';

const install = require('../../src/install');

module.exports.command = 'install <addon>';

module.exports.describe = 'install an addon';

module.exports.handler = async function handler(argv) {
  let addon = argv['addon'];

  try {
    let message = await install({
      addon
    });
    if (message) {
      console.log(message);
    }
  } catch (err) {
    console.error(err);
  }
};
