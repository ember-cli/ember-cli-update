'use strict';

const expect = require('chai').expect;
const getPackageVersion = require('../../src/get-package-version');

describe('Integration - getPackageVersion', function() {
  it('works', function() {
    expect(getPackageVersion('test/fixtures/version')).to.equal('2.11');
  });
});
