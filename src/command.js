'use strict';

const emberCliUpdate = require('.');
const args = require('./args');

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
    },
    {
      name: 'create-custom-diff',
      aliases: args['create-custom-diff'].alias,
      description: args['create-custom-diff'].description,
      type: Boolean,
      default: args['create-custom-diff'].default
    }
  ],

  async run(options) {
    options.wasRunAsExecutable = true;
    await emberCliUpdate(options);
  }
};
