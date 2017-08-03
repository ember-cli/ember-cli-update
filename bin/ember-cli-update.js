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
      type: 'string'
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
