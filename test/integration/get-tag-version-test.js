'use strict';

const expect = require('chai').expect;
const getTagVersion = require('../../src/get-tag-version');

describe('Integration - getTagVersion', function() {
  this.timeout(10000);

  it('works', function() {
    expect(getTagVersion('beta')).to.not.be.empty;
    expect(getTagVersion('latest')).to.not.be.empty;
  });
});
