'use strict';

const args = require('../../src/args');
const init = require('../../src/init');

module.exports.command = 'init';

module.exports.describe = 'initialize a blueprint';

module.exports.builder = {
  blueprint: args['blueprint'],
  to: args['to'],
  outputRepo: args['output-repo'],
  codemodsSource: args['codemods-source']
};

module.exports.handler = async function handler(argv) {
  try {
    let result = await init({
      ...argv,
      blueprintOptions: argv._.slice(1)
    });

    let message = await result.promise;
    if (message) {
      console.log(message);
    }
  } catch (err) {
    console.error(err);
  }
};
