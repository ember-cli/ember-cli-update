'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('chai');
const getPackageName = require('../../src/get-package-name');

describe(getPackageName, function() {
  it('gets app package', function() {
    expect(getPackageName('app')).to.equal('ember-cli');
  });

  it('gets addon package', function() {
    expect(getPackageName('addon')).to.equal('ember-cli');
  });

  it('gets glimmer package', function() {
    expect(getPackageName('glimmer')).to.equal('@glimmer/blueprint');
  });
});
