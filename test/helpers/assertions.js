'use strict';

const { expect } = require('./chai');

module.exports.assertNormalUpdate = function(status) {
  // changed locally, no change upstream
  expect(status).to.not.match(/^ .*\.ember-cli$/m);

  // exists locally, also added upstream with changes
  expect(status).to.match(/^M {2}.*\.eslintrc\.js$/m);

  // changed locally, removed upstream
  expect(status).to.match(/^D {2}.*bower\.json$/m);

  // changed locally, also changed upstream
  expect(status).to.match(/^M {2}.*README\.md$/m);
};

module.exports.assertNoUnstaged = function(status) {
  // assert no unstaged changes
  expect(status).to.not.match(/^.\w/m);
};

module.exports.assertNoStaged = function(status) {
  // assert no staged changes
  expect(status).to.not.match(/^\w/m);
};

module.exports.assertCodemodRan = function(status) {
  // codemod changed locally, no change upstream
  expect(status).to.match(/^M {2}.*app\/controllers\/application\.js$/m);

  // codemod changed locally, also changed upstream
  expect(status).to.match(/^M {2}.*app\/router\.js$/m);
};
