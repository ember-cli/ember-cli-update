'use strict';

module.exports = {
  name: 'ember-cli-update',

  includedCommands() {
    return {
      update: require('./command')
    };
  }
};
