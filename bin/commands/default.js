'use strict';

const args = require('../../src/args');
const emberCliUpdate = require('../../src');
const reset = require('../../src/reset');

module.exports.command = '$0';

module.exports.builder = args;

module.exports.handler = async function handler(argv) {
  try {
    let result;
    if (argv.reset) {
      result = await reset(argv);
    } else {
      result = await emberCliUpdate({
        ...argv,
        blueprintOptions: argv._.slice(0)
      });
    }

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
