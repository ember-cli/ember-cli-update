'use strict';

const emberCliUpdate = require('.');
const args = require('./args');

module.exports = {
  name: 'update',
  description: 'Updates your app or addon to the latest Ember CLI version.',
  works: 'insideProject',

  availableOptions: [
    {
      name: 'to',
      description: args['to'].description,
      type: String,
      default: args['to'].default
    }
  ],

  run: emberCliUpdate
};
