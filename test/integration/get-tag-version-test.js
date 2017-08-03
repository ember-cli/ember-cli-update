'use strict';

const expect = require('chai').expect;
const getTagVersion = require('../../src/get-tag-version');
const semver = require('semver');

describe('Integration - getTagVersion', function() {
  this.timeout(5000);

  it('works for beta', function() {
    expect(semver.valid(getTagVersion('beta'))).to.not.be.null;
  });

  it('works for latest', function() {
    expect(semver.valid(getTagVersion('latest'))).to.not.be.null;
  });
});
