'use strict';

const args = require('../../src/args');
const init = require('../../src/init');

module.exports.command = 'init';

module.exports.describe = 'initialize a blueprint';

module.exports.builder = {
  blueprint: args['blueprint'],
  to: args['to'],
  resolveConflicts: args['resolve-conflicts'],
  reset: args['reset']
};

module.exports.blueprintOptionsDefault = [];

module.exports.handler = async function handler(argv) {
  let blueprint = argv['blueprint'];
  let to = argv['to'];
  let resolveConflicts = argv['resolve-conflicts'];
  let reset = argv['reset'];
  let blueprintOptions = argv['--'] || module.exports.blueprintOptionsDefault;

  try {
    let message = await init({
      blueprint,
      to,
      resolveConflicts,
      reset,
      blueprintOptions,
      wasRunAsExecutable: true
    });
    if (message) {
      console.log(message);
    }
  } catch (err) {
    console.error(err);
  }
};
