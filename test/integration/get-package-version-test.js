'use strict';

const expect = require('chai').expect;
const getPackageVersion = require('../../src/get-package-version');

describe('Integration - getPackageVersion', function() {
  it('returns falsy for no devDependencies', function() {
    expect(getPackageVersion('test/fixtures/version/no-dev-deps')).to.be.not.ok;
  });

  it('returns falsy for no ember-cli', function() {
    expect(getPackageVersion('test/fixtures/version/no-ember-cli')).to.be.not.ok;
  });

  it('works with only ember-cli', function() {
    expect(getPackageVersion('test/fixtures/version/ember-cli')).to.equal('2.11');
  });
});
