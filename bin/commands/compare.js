'use strict';

const args = require('../../src/args');
const compare = require('../../src/compare');

module.exports.command = 'compare';

module.exports.describe = args['compare-only'].description;

module.exports.builder = {
  packageName: args['package-name'],
  blueprint: args['blueprint'],
  to: args['to']
};

module.exports.handler = async function handler(argv) {
  try {
    let result = await compare(argv);

    console.log(result);
  } catch (err) {
    console.error(err);
  }
};
