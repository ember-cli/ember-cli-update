'use strict';

const expect = require('chai').expect;

module.exports = function assertNormalUpdate(status) {
  // changed locally, no change upstream
  expect(status).to.not.contain(' .ember-cli');

  // exists locally, also added upstream with changes
  expect(status).to.contain('modified:   .eslintrc.js');

  // changed locally, removed upstream
  expect(status).to.contain('deleted:    bower.json');

  // changed locally, also changed upstream
  expect(status).to.contain('modified:   README.md');
};
