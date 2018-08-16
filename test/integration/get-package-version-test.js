'use strict';

const { expect } = require('chai');
const getPackageVersion = require('../../src/get-package-version');

describe('Integration - getPackageVersion', function() {
  it('throws if no devDependencies', function() {
    let packageJson = {};

    expect(() => {
      getPackageVersion(packageJson);
    }).to.throw('Ember CLI blueprint version could not be determined');
  });

  it('throws if no ember-cli for app type', function() {
    let packageJson = {
      devDependencies: {}
    };

    expect(() => {
      getPackageVersion(packageJson, 'app');
    }).to.throw('Ember CLI blueprint version could not be determined');
  });

  it('throws if no ember-cli for addon type', function() {
    let packageJson = {
      devDependencies: {}
    };

    expect(() => {
      getPackageVersion(packageJson, 'addon');
    }).to.throw('Ember CLI blueprint version could not be determined');
  });

  it('works for app type', function() {
    let packageJson = {
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(getPackageVersion(packageJson, 'app')).to.equal('2.11');
  });

  it('works for addon type', function() {
    let packageJson = {
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(getPackageVersion(packageJson, 'addon')).to.equal('2.11');
  });

  it('works for glimmer type', function() {
    let packageJson = {
      devDependencies: {
        '@glimmer/blueprint': '0.3',
        'ember-cli': '2.11'
      }
    };

    expect(getPackageVersion(packageJson, 'glimmer')).to.equal('0.3');
  });
});
