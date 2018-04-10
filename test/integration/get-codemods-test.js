'use strict';

const expect = require('chai').expect;
const getCodemods = require('../../src/get-codemods');

describe('Integration - getCodemods', function() {
  this.timeout(5000);

  it('gets codemods', function() {
    return getCodemods().then(codemods => {
      expect(codemods).to.be.an.instanceof(Object);
    });
  });
});
