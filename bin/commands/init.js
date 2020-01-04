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

module.exports.handler = async function handler(argv) {
  let blueprint = argv['blueprint'];
  let to = argv['to'];
  let resolveConflicts = argv['resolve-conflicts'];
  let reset = argv['reset'];
  let blueprintOptions = argv._.slice(1);

  try {
    let result = await init({
      blueprint,
      to,
      resolveConflicts,
      reset,
      blueprintOptions
    });

    let ps = result.resolveConflictsProcess;
    if (ps) {
      process.stdin.pipe(ps.stdin);
      ps.stdout.pipe(process.stdout);
      ps.stderr.pipe(process.stderr);
    }

    let message = await result.promise;
    if (message) {
      console.log(message);
    }

    // since we are piping, not inheriting, the child process
    // doesn't have the power to close its parent
    if (ps) {
      // eslint-disable-next-line no-process-exit
      process.exit();
    }
  } catch (err) {
    console.error(err);
  }
};
