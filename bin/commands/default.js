'use strict';

const args = require('../../src/args');
const emberCliUpdate = require('../../src');

module.exports.command = '$0';

module.exports.builder = args;

module.exports.handler = async function handler(argv) {
  let blueprint = argv['blueprint'];
  let from = argv['from'];
  let to = argv['to'];
  let resolveConflicts = argv['resolve-conflicts'];
  let runCodemods = argv['run-codemods'];
  let codemodsUrl = argv['codemods-url'];
  let codemodsJson = argv['codemods-json'];
  let reset = argv['reset'];
  let compareOnly = argv['compare-only'];
  let statsOnly = argv['stats-only'];
  let listCodemods = argv['list-codemods'];
  let createCustomDiff = argv['create-custom-diff'];
  let blueprintOptions = argv._.slice(0);

  try {
    let result = await emberCliUpdate({
      blueprint,
      blueprintOptions,
      from,
      to,
      resolveConflicts,
      runCodemods,
      codemodsUrl,
      codemodsJson,
      reset,
      compareOnly,
      statsOnly,
      listCodemods,
      createCustomDiff
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
