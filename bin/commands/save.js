'use strict';

const args = require('../../src/args');
const save = require('../../src/save');

module.exports.command = 'save';

module.exports.describe = 'save old blueprint state';

module.exports.builder = {
  packageName: args['package-name'],
  blueprint: args['blueprint'],
  from: args['from'],
  outputRepo: args['output-repo'],
  codemodsSource: args['codemods-source']
};

module.exports.handler = async function handler(argv) {
  try {
    await save({
      ...argv,
      blueprintOptions: argv._.slice(1)
    });
  } catch (err) {
    console.error(err);
  }
};
