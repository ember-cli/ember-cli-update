'use strict';

const args = require('../../src/args');
const save = require('../../src/save');

module.exports.command = 'save';

module.exports.describe = 'save old blueprint state';

module.exports.builder = {
  blueprint: args['blueprint'],
  from: args['from']
};

module.exports.handler = async function handler(argv) {
  let blueprint = argv['blueprint'];
  let from = argv['from'];
  let blueprintOptions = argv._.slice(1);

  try {
    await save({
      blueprint,
      from,
      blueprintOptions
    });
  } catch (err) {
    console.error(err);
  }
};
