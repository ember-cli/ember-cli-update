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
