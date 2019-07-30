#!/usr/bin/env node
'use strict';

const emberCliUpdate = require('../src');
const args = require('../src/args');

const { argv } = require('yargs')
  .options(args);

const blueprint = argv['blueprint'];
const from = argv['from'];
const to = argv['to'];
const resolveConflicts = argv['resolve-conflicts'];
const runCodemods = argv['run-codemods'];
const reset = argv['reset'];
const compareOnly = argv['compare-only'];
const statsOnly = argv['stats-only'];
const listCodemods = argv['list-codemods'];
const createCustomDiff = argv['create-custom-diff'];

// Displays a message on the terminal if a new version of the package is available.
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 14, // 2 weeks
  boxenOpts: {
    padding: 1,
    margin: 1,
    align: 'center',
    borderColor: 'yellow',
    borderStyle: 'round'
  }
}).notify();

(async() => {
  try {
    let message = await emberCliUpdate({
      blueprint,
      from,
      to,
      resolveConflicts,
      runCodemods,
      reset,
      compareOnly,
      statsOnly,
      listCodemods,
      createCustomDiff,
      wasRunAsExecutable: true
    });
    if (message) {
      console.log(message);
    }
  } catch (err) {
    console.error(err);
  }
})();
