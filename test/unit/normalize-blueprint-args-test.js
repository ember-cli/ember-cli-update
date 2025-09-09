'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const normalizeBlueprintArgs = require('../../src/normalize-blueprint-args');

describe(normalizeBlueprintArgs, function () {
  it('copies if missing', function () {
    let blueprintArgs = normalizeBlueprintArgs({
      blueprintName: 'foo'
    });

    expect(blueprintArgs).to.deep.equal({
      packageName: 'foo',
      blueprintName: 'foo'
    });
  });

  it('ignores if present', function () {
    let blueprintArgs = normalizeBlueprintArgs({
      packageName: 'bar',
      blueprintName: 'foo'
    });

    expect(blueprintArgs).to.deep.equal({
      packageName: 'bar',
      blueprintName: 'foo'
    });
  });
});
