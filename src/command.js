'use strict';

const emberCliUpdate = require('.');
const reset = require('./reset');
const args = require('./args');
const stats = require('./stats');
const compare = require('./compare');

module.exports = {
  name: 'update',
  description: 'Updates your app or addon to the latest Ember CLI version.',
  works: 'insideProject',

  availableOptions: [
    {
      name: 'blueprint',
      aliases: args['blueprint'].alias,
      description: args['blueprint'].description,
      type: String
    },
    {
      name: 'from',
      description: args['from'].description,
      type: String
    },
    {
      name: 'to',
      description: args['to'].description,
      type: String,
      default: args['to'].default
    },
    {
      name: 'resolve-conflicts',
      description: args['resolve-conflicts'].description,
      type: Boolean,
      default: args['resolve-conflicts'].default
    },
    {
      name: 'run-codemods',
      description: args['run-codemods'].description,
      type: Boolean,
      default: args['run-codemods'].default
    },
    {
      name: 'codemods-source',
      description: args['codemods-source'].description,
      type: String
    },
    {
      name: 'codemods-json',
      description: args['codemods-json'].description,
      type: String
    },
    {
      name: 'reset',
      description: args['reset'].description,
      type: Boolean,
      default: args['reset'].default
    },
    {
      name: 'compare-only',
      description: args['compare-only'].description,
      type: Boolean,
      default: args['compare-only'].default
    },
    {
      name: 'stats-only',
      description: args['stats-only'].description,
      type: Boolean,
      default: args['stats-only'].default
    },
    {
      name: 'list-codemods',
      description: args['list-codemods'].description,
      type: Boolean,
      default: args['list-codemods'].default
    }
  ],

  async run(options) {
    let result;
    if (options.reset) {
      result = await reset(options);
    } else if (options.statsOnly) {
      result = await stats(options);
    } else if (options.compareOnly) {
      result = await compare(options);
    } else {
      result = await emberCliUpdate(options);
    }

    let ps = result.resolveConflictsProcess;
    if (ps) {
      process.stdin.pipe(ps.stdin);
      ps.stdout.pipe(process.stdout);
      ps.stderr.pipe(process.stderr);
    }

    await result.promise;
  }
};
