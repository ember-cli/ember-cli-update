#!/usr/bin/env node
'use strict';

const emberCliUpdate = require('../src');
const args = require('../src/args');

const argv = require('yargs')
  .options(args)
  .argv;

const from = argv['from'];
const to = argv['to'];
const resolveConflicts = argv['resolve-conflicts'];
const runCodemods = argv['run-codemods'];
const reset = argv['reset'];
const compareOnly = argv['compare-only'];
const dryRun = argv['dry-run'];
const listCodemods = argv['list-codemods'];

emberCliUpdate({
  from,
  to,
  resolveConflicts,
  runCodemods,
  reset,
  compareOnly,
  dryRun,
  listCodemods
}).catch(console.error);
