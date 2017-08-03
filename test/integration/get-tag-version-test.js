'use strict';

const expect = require('chai').expect;
const getTagVersion = require('../../src/get-tag-version');
const semver = require('semver');

describe('Integration - getTagVersion', function() {
  this.timeout(10000);

  it('works', function() {
    expect(semver.valid(getTagVersion('beta'))).to.not.be.null;
    expect(semver.valid(getTagVersion('latest'))).to.not.be.null;
  });
});
