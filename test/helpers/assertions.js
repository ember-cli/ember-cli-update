'use strict';

const { expect } = require('./chai');

module.exports.assertNoUnstaged = function (status) {
  expect(status).to.not.match(/^.\w/m);
};

module.exports.assertNoStaged = function (status) {
  expect(status).to.not.match(/^\w/m);
};

module.exports.assertCodemodRan = function (status) {
  expect(status).to.match(/^A {2}.*/m);
};
