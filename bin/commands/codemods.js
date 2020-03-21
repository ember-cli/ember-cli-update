'use strict';

const args = require('../../src/args');
const codemods = require('../../src/codemods');

module.exports.command = 'codemods';

module.exports.describe = args['run-codemods'].description;

module.exports.builder = {
  packageName: args['package-name'],
  blueprint: args['blueprint'],
  'source-json': args['codemods-json'],
  list: args['list-codemods']
};

module.exports.handler = async function handler(argv) {
  try {
    let result = await codemods(argv);

    console.log(result);
  } catch (err) {
    console.error(err);
  }
};
