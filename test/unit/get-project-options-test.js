'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const getProjectOptions = require('../../src/get-project-options');

describe(getProjectOptions, function() {
  it('throws if not found', function() {
    let packageJson = {};

    expect(() => {
      getProjectOptions(packageJson);
    }).to.throw('Ember CLI project type could not be determined');
  });

  it('detects ember app with ember-cli as a devDependency', function() {
    let packageJson = {
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['app']);
  });

  it('detects ember app with ember-cli as a dependency', function() {
    let packageJson = {
      dependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['app']);
  });

  it('detects ember app with ember-cli as an empty string', function() {
    let packageJson = {
      devDependencies: {
        'ember-cli': ''
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['app']);
  });

  it('detects ember addon with ember-cli as a devDependency', function() {
    let packageJson = {
      keywords: [
        'ember-addon'
      ],
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['addon']);
  });

  it('detects ember addon with ember-cli as a dependency', function() {
    let packageJson = {
      keywords: [
        'ember-addon'
      ],
      dependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['addon']);
  });

  it('detects ember addon with ember-cli as an empty string', function() {
    let packageJson = {
      keywords: [
        'ember-addon'
      ],
      devDependencies: {
        'ember-cli': ''
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['addon']);
  });

  it('detects glimmer app with glimmer as a devDependency', function() {
    let packageJson = {
      devDependencies: {
        '@glimmer/blueprint': '0.3'
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['glimmer']);
  });

  it('detects glimmer app with glimmer as a dependency', function() {
    let packageJson = {
      dependencies: {
        '@glimmer/blueprint': '0.3'
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['glimmer']);
  });

  it('detects glimmer app with glimmer as an empty string', function() {
    let packageJson = {
      devDependencies: {
        '@glimmer/blueprint': ''
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['glimmer']);
  });
});
