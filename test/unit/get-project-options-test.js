'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('chai');
const getProjectOptions = require('../../src/get-project-options');

describe(getProjectOptions, function() {
  it('throws if not found', function() {
    let packageJson = {};

    expect(() => {
      getProjectOptions(packageJson);
    }).to.throw('Ember CLI project type could not be determined');
  });

  it('detects ember app', function() {
    let packageJson = {
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['app']);
  });

  it('detects ember addon', function() {
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

  it('detects glimmer app', function() {
    let packageJson = {
      devDependencies: {
        '@glimmer/blueprint': '0.3'
      }
    };

    expect(getProjectOptions(packageJson)).to.deep.equal(['glimmer']);
  });
});
