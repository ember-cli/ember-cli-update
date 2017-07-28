'use strict';

const emberCliUpdate = require('.');
const args = require('./args');

module.exports = {
  name: 'update',
  description: 'Updates your app or addon to the latest Ember CLI version.',
  works: 'insideProject',

  availableOptions: [
    {
      name: 'dist-tag',
      description: args['dist-tag'].description,
      type: String,
      default: args['dist-tag'].default
    },
    {
      name: 'version',
      description: args['version'].description,
      type: String,
      aliases: args['version'].alias
    }
  ],

  run: emberCliUpdate
};
