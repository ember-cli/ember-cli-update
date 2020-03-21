'use strict';

const args = require('../../src/args');
const stats = require('../../src/stats');

module.exports.command = 'stats';

module.exports.describe = 'list blueprint version updates';

module.exports.builder = {
  packageName: args['package-name'],
  blueprint: args['blueprint']
};

module.exports.handler = async function handler(argv) {
  try {
    let result = await stats(argv);

    console.log(result);
  } catch (err) {
    console.error(err);
  }
};
