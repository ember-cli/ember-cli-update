#!/usr/bin/env node
'use strict';

const emberCliUpdate = require('../src');
const args = require('../src/args');

const argv = require('yargs')
  .options(args)
  .help()
  .argv;

const distTag = argv['dist-tag'];
const version = argv['version'];

emberCliUpdate({
  distTag,
  version
});
