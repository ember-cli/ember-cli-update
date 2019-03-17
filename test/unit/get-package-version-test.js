'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const getPackageVersion = require('../../src/get-package-version');

describe(getPackageVersion, function() {
  it('throws if no packages', function() {
    let packageJson = {};

    expect(() => {
      getPackageVersion(packageJson, 'test-package-name');
    }).to.throw('Ember CLI blueprint version could not be determined');
  });

  it('throws if no package', function() {
    let packageJson = {
      devDependencies: {}
    };

    expect(() => {
      getPackageVersion(packageJson, 'test-package-name');
    }).to.throw('Ember CLI blueprint version could not be determined');
  });

  it('gets version as dependency', function() {
    let packageJson = {
      dependencies: {
        'test-package-name': '2.11'
      }
    };

    expect(getPackageVersion(packageJson, 'test-package-name')).to.equal('2.11');
  });
  it('gets version as devDependency', function() {
    let packageJson = {
      devDependencies: {
        'test-package-name': '2.11'
      }
    };

    expect(getPackageVersion(packageJson, 'test-package-name')).to.equal('2.11');
  });
});
