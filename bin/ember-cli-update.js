#!/usr/bin/env node
'use strict';

const emberCliUpdate = require('../src');

const argv = require('yargs')
  .options({
    'end-tag': {
      type: 'string'
    }
  })
  .argv;

const endTag = argv['end-tag'];

emberCliUpdate({
  endTag
});
