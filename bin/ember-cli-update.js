#!/usr/bin/env node
'use strict';

const emberCliUpdate = require('../src');

const argv = require('yargs')
  .options({
    'version': {
      type: 'string'
    }
  })
  .help()
  .argv;

const version = argv['version'];

emberCliUpdate({
  version
});
