'use strict';

module.exports = {
  description: 'ember-cli-update-git-blueprint-test',

  locals(options) {
    let name = options.entity.name;

    return {
      name
    };
  }
};
