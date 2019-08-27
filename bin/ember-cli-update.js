#!/usr/bin/env node
'use strict';

require('yargs')
  .commandDir('commands')
  .parserConfiguration({
    'populate--': true,
    'collect-unknown-options': true
  })
  .argv;

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
