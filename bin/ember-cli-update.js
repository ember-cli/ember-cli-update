#!/usr/bin/env node
'use strict';

const emberCliUpdate = require('../src');

const argv = require('yargs')
  .options({
    'end-tag': {
      type: 'string'
    }
  })
  .help()
  .argv;

const endTag = argv['end-tag'];

emberCliUpdate({
  endTag
});
