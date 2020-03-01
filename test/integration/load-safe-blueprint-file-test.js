'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const loadSafeBlueprint = require('../../src/load-safe-blueprint');
const sinon = require('sinon');

describe(loadSafeBlueprintFile, function() {
  afterEach(function() {
    sinon.restore();
  });

  it('populates when missing', async function() {
    let dir = 'test/fixtures/ember-cli-update-json/missing/ember-cli-update.json';

    let emberCliUpdateJson = await loadSafeBlueprintFile(dir);

    expect(emberCliUpdateJson).to.deep.equal({
      schemaVersion: '1.0.0',
      blueprints: []
    });
  });

  it('populates when empty', async function() {
    let dir = 'test/fixtures/ember-cli-update-json/empty/ember-cli-update.json';

    let emberCliUpdateJson = await loadSafeBlueprintFile(dir);

    expect(emberCliUpdateJson).to.deep.equal({
      schemaVersion: '1.0.0',
      blueprints: []
    });
  });

  it('flattens packages', async function() {
    let dir = 'test/fixtures/ember-cli-update-json/normal/ember-cli-update.json';

    let emberCliUpdateJson = await loadSafeBlueprintFile(dir);

    expect(emberCliUpdateJson).to.deep.equal({
      schemaVersion: '1.0.0',
      blueprints: [loadSafeBlueprint({
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        location: '../test-blueprint',
        version: '0.0.1',
        outputRepo: 'https://github.com/test/output-repo',
        codemodsSource: 'test-codemods',
        isBaseBlueprint: true
      })]
    });
  });

  it('throws with unexpected version', async function() {
    let dir = 'test/fixtures/ember-cli-update-json/unexpected-version/ember-cli-update.json';

    let promise = loadSafeBlueprintFile(dir);

    await expect(promise).to.eventually.be.rejectedWith('schemaVersion 255.0.0 is unexpectedly newer than the current 1.0.0.');
  });

  it('logs a warning when updating schema version', async function() {
    let dir = 'test/fixtures/ember-cli-update-json/old/ember-cli-update.json';

    let warn = sinon.stub(console, 'warn').withArgs('Updating schemaVersion from 0 to 1.0.0.');

    let emberCliUpdateJson = await loadSafeBlueprintFile(dir);

    expect(warn).to.be.calledOnce;

    expect(emberCliUpdateJson).to.deep.equal({
      schemaVersion: '1.0.0',
      blueprints: [loadSafeBlueprint({
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        location: '../test-blueprint',
        version: '0.0.1',
        outputRepo: 'https://github.com/test/output-repo',
        codemodsSource: 'test-codemods',
        isBaseBlueprint: true
      })]
    });
  });
});
