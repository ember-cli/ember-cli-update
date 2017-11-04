'use strict';

const expect = require('chai').expect;
const getPackageVersion = require('../../src/get-package-version');

describe('Integration - getPackageVersion', function() {
  it('throws if no package.json', function() {
    expect(() => {
      getPackageVersion('test/fixtures/no-package-json');
    }).to.throw('No package.json was found in this directory');
  });

  it('throws if malformed package.json', function() {
    expect(() => {
      getPackageVersion('test/fixtures/malformed-package-json');
    }).to.throw('The package.json is malformed');
  });

  it('throws if no devDependencies', function() {
    expect(() => {
      getPackageVersion('test/fixtures/version/no-dev-deps');
    }).to.throw('Ember CLI was not found in this project\'s package.json');
  });

  it('throws if no ember-cli', function() {
    expect(() => {
      getPackageVersion('test/fixtures/version/no-ember-cli');
    }).to.throw('Ember CLI was not found in this project\'s package.json');
  });

  it('works with only ember-cli', function() {
    expect(getPackageVersion('test/fixtures/version/ember-cli')).to.equal('2.11');
  });
});
