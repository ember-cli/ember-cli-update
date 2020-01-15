'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');

describe(loadSafeBlueprintFile, function() {
  it('populates when missing', async function() {
    let dir = 'test/fixtures/ember-cli-update-json/missing/ember-cli-update.json';

    let emberCliUpdateJson = await loadSafeBlueprintFile(dir);

    expect(emberCliUpdateJson).to.deep.equal({
      schemaVersion: 0,
      blueprints: []
    });
  });

  it('populates when empty', async function() {
    let dir = 'test/fixtures/ember-cli-update-json/empty/ember-cli-update.json';

    let emberCliUpdateJson = await loadSafeBlueprintFile(dir);

    expect(emberCliUpdateJson).to.deep.equal({
      schemaVersion: 0,
      blueprints: []
    });
  });

  it('flattens packages', async function() {
    let dir = 'test/fixtures/ember-cli-update-json/normal/ember-cli-update.json';

    let emberCliUpdateJson = await loadSafeBlueprintFile(dir);

    expect(emberCliUpdateJson).to.deep.equal({
      schemaVersion: 0,
      blueprints: [{
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        location: '../test-blueprint',
        version: '0.0.1',
        codemodsSource: 'test-codemods',
        isBaseBlueprint: true
      }]
    });
  });
});
