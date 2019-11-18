'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const isDefaultBlueprint = require('../../src/is-default-blueprint');

describe(isDefaultBlueprint, function() {
  it('detects default blueprint', function() {
    expect(isDefaultBlueprint({
      packageName: 'ember-cli',
      name: 'ember-cli'
    })).to.be.true;
  });

  it('detects custom blueprint', function() {
    expect(isDefaultBlueprint({
      packageName: 'ember-cli',
      name: 'custom-blueprint'
    })).to.be.false;
  });
});
