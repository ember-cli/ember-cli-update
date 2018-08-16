'use strict';

const { expect } = require('chai');
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
    }).to.throw('Ember CLI blueprint version could not be determined');
  });

  it('throws if no ember-cli for app type', function() {
    expect(() => {
      getPackageVersion('test/fixtures/version/no-ember-cli', 'app');
    }).to.throw('Ember CLI blueprint version could not be determined');
  });

  it('throws if no ember-cli for addon type', function() {
    expect(() => {
      getPackageVersion('test/fixtures/version/no-ember-cli', 'addon');
    }).to.throw('Ember CLI blueprint version could not be determined');
  });

  it('works for app type', function() {
    expect(getPackageVersion('test/fixtures/version/ember', 'app')).to.equal('2.11');
  });

  it('works for addon type', function() {
    expect(getPackageVersion('test/fixtures/version/ember', 'addon')).to.equal('2.11');
  });

  it('works for glimmer type', function() {
    expect(getPackageVersion('test/fixtures/version/glimmer', 'glimmer')).to.equal('0.3');
  });
});
