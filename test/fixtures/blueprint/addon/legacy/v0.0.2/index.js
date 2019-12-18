'use strict';

// Test that peer-deps, whether explicit or implicit,
// don't throw, for instance if we try to download to tmp
// and `npm install <folder>`, which will symlink.
// https://github.com/salsify/ember-cli-dependency-lint/blob/v1.0.3/lib/commands/dependency-lint.js#L5
require('ember-cli/lib/models/command');

module.exports = {
  name: require('./package').name
};
