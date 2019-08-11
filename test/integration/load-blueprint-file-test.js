'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const loadBlueprintFile = require('../../src/load-blueprint-file');

describe(loadBlueprintFile, function() {
  it('doesn\'t throw when missing', async function() {
    let dir = 'test/fixtures/ember-cli-update-json/missing';

    let emberCliUpdateJson = await loadBlueprintFile(dir);

    expect(emberCliUpdateJson).to.be.undefined;
  });

  it('doesn\'t populate when empty', async function() {
    let dir = 'test/fixtures/ember-cli-update-json/empty';

    let emberCliUpdateJson = await loadBlueprintFile(dir);

    expect(emberCliUpdateJson).to.deep.equal({});
  });
});
