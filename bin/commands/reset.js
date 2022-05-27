'use strict';

const args = require('../../src/args');
const reset = require('../../src/reset');

module.exports.command = 'reset';

module.exports.describe = 'reset a blueprint';

module.exports.builder = {
  packageName: args['package-name'],
  blueprint: args['blueprint'],
  to: args['to']
};

module.exports.handler = async function handler(argv) {
  try {
    let result = await reset(argv);

    let message = await result.promise;
    if (message) {
      console.log(message);
    }
  } catch (err) {
    console.error(err);
  }
};
