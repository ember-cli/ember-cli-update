#!/usr/bin/env node
'use strict';

const emberCliUpdate = require('../src');
const args = require('../src/args');

const argv = require('yargs')
  .options(args)
  .version()
  .help()
  .argv;

const to = argv['to'];

emberCliUpdate({
  to
});
