#!/usr/bin/env node
'use strict';

const emberCliUpdate = require('../src');
const args = require('../src/args');

const { argv } = require('yargs')
  .options(args);

const from = argv['from'];
const to = argv['to'];
const resolveConflicts = argv['resolve-conflicts'];
const runCodemods = argv['run-codemods'];
const reset = argv['reset'];
const compareOnly = argv['compare-only'];
const dryRun = argv['dry-run'];
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

emberCliUpdate({
  from,
  to,
  resolveConflicts,
  runCodemods,
  reset,
  compareOnly,
  dryRun,
  statsOnly,
  listCodemods,
  createCustomDiff
}).then(message => {
  if (message) {
    console.log(message);
  }
}).catch(console.error);
