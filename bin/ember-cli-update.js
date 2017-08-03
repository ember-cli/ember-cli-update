#!/usr/bin/env node
'use strict';

const emberCliUpdate = require('../src');

const argv = require('yargs')
  .options({
    'dist-tag': {
      type: 'string',
      default: 'latest',
      description: 'Update via dist-tag ("latest", "beta", etc...)'
    },
    'version': {
      alias: 'v',
      type: 'string',
      description: 'Update to a version that isn\'t latest'
    }
  })
  .help()
  .argv;

const distTag = argv['dist-tag'];
const version = argv['version'];

emberCliUpdate({
  distTag,
  version
});
