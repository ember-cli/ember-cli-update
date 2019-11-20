'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const findBlueprint = require('../../src/find-blueprint');

describe(findBlueprint, function() {
  let blueprints;

  beforeEach(function() {
    blueprints = [
      {
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        test: 'test-1'
      },
      {
        packageName: 'test-blueprint',
        name: 'test-blueprint-2',
        test: 'test-2'
      },
      {
        packageName: 'test-blueprint-2',
        name: 'test-blueprint',
        test: 'test-3'
      }
    ];
  });

  it('finds blueprint', function() {
    let packageName = 'test-blueprint';
    let name = 'test-blueprint';

    let expected = blueprints[0];

    let actual = findBlueprint(blueprints, packageName, name);

    expect(actual).to.deep.equal({
      packageName: 'test-blueprint',
      name: 'test-blueprint',
      test: 'test-1'
    });

    expect(actual).to.equal(expected);
  });

  it('package mismatch', function() {
    let packageName = 'test-blueprint-3';
    let name = 'test-blueprint';

    let actual = findBlueprint(blueprints, packageName, name);

    expect(actual).to.be.undefined;
  });

  it('blueprint mismatch', function() {
    let packageName = 'test-blueprint';
    let name = 'test-blueprint-3';

    let actual = findBlueprint(blueprints, packageName, name);

    expect(actual).to.be.undefined;
  });
});
