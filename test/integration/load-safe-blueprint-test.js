'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const loadSafeBlueprint = require('../../src/load-safe-blueprint');

describe(loadSafeBlueprint, function() {
  it('works', async function() {
    let blueprint = loadSafeBlueprint({
      foo: 'bar'
    });

    expect(blueprint).to.deep.equal({
      foo: 'bar',
      options: []
    });
  });

  it('doesn\'t remove existing options', async function() {
    let blueprint = loadSafeBlueprint({
      options: ['foo']
    });

    expect(blueprint).to.deep.equal({
      options: ['foo']
    });
  });

  it('doesn\'t reorder existing options', async function() {
    let blueprint = loadSafeBlueprint({
      foo: 'bar',
      options: ['foo']
    });

    expect(Object.keys(blueprint)).to.deep.equal([
      'foo',
      'options'
    ]);
  });
});
