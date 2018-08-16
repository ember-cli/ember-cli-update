'use strict';

const { expect } = require('chai');
const getProjectType = require('../../src/get-project-type');

describe('Integration - getProjectType', function() {
  it('throws if not found', function() {
    let packageJson = {};

    expect(() => {
      getProjectType(packageJson);
    }).to.throw('Ember CLI project type could not be determined');
  });

  it('detects ember app', function() {
    let packageJson = {
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(getProjectType(packageJson)).to.equal('app');
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

    expect(getProjectType(packageJson)).to.equal('addon');
  });

  it('detects glimmer app', function() {
    let packageJson = {
      devDependencies: {
        '@glimmer/blueprint': '0.3'
      }
    };

    expect(getProjectType(packageJson)).to.equal('glimmer');
  });
});
