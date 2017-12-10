'use strict';

const emberCliUpdate = require('.');
const args = require('./args');

module.exports = {
  name: 'update',
  description: 'Updates your app or addon to the latest Ember CLI version.',
  works: 'insideProject',

  availableOptions: [
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
      name: 'reset',
      description: args['reset'].description,
      type: Boolean,
      default: args['reset'].default
    }
  ],

  run: emberCliUpdate
};
