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
      name: 'ignore-conflicts',
      description: args['ignore-conflicts'].description,
      type: Boolean,
      default: args['ignore-conflicts'].default
    },
    {
      name: 'run-codemods',
      description: args['run-codemods'].description,
      type: Boolean,
      default: args['run-codemods'].default
    }
  ],

  run: emberCliUpdate
};
