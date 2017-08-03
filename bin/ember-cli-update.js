#!/usr/bin/env node
'use strict';

const emberCliUpdate = require('../src');

const argv = require('yargs')
  .options({
    'version': {
      alias: 'v',
      type: 'string',
      description: 'Update to a version that isn\'t latest'
    }
  })
  .help()
  .argv;

const version = argv['version'];

emberCliUpdate({
  version
});
