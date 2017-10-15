'use strict';

const expect = require('chai').expect;

module.exports.assertNormalUpdate = function assertNormalUpdate(status) {
  // changed locally, no change upstream
  expect(status).to.not.contain(` .ember-cli
`);

  // exists locally, also added upstream with changes
  expect(status).to.contain(`M  .eslintrc.js
`);

  // changed locally, removed upstream
  expect(status).to.contain(`D  bower.json
`);

  // changed locally, also changed upstream
  expect(status).to.contain(`M  README.md
`);

  // assert no unstaged changes
  expect(status).to.not.match(/^( M |MM ).+$/m);
};

module.exports.assertNoUnstaged = function assertNoUnstaged(status) {
  // assert no unstaged changes
  expect(status).to.not.match(/^( M |MM ).+$/m);
};

module.exports.assertCodemodRan = function assertCodemodRan(status) {
  // codemod changed locally, no change upstream
  expect(status).to.match(/^M {2}.*app\/controllers\/application\.js$/m);

  // codemod changed locally, also changed upstream
  expect(status).to.match(/^M {2}.*app\/router\.js$/m);
};
