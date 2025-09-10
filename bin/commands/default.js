'use strict';

const args = require('../../src/args');
const emberCliUpdate = require('../../src');
const reset = require('../../src/reset');
const stats = require('../../src/stats');
const compare = require('../../src/compare');
const codemods = require('../../src/codemods');

module.exports.command = '$0';

module.exports.builder = args;

module.exports.handler = async function handler(argv) {
  try {
    let result;
    if (argv.reset) {
      result = await reset(argv);
    } else if (argv.statsOnly) {
      result = { promise: stats(argv) };
    } else if (argv.compareOnly) {
      result = { promise: compare(argv) };
    } else if (argv.listCodemods || argv.runCodemods) {
      result = {
        promise: codemods({
          ...argv,
          list: argv.listCodemods,
          sourceJson: argv.codemodsJson
        })
      };
    } else {
      result = await emberCliUpdate(argv);
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
      process.exit();
    }
  } catch (err) {
    console.error(err);
  }
};
