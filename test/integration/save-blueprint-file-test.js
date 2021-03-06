'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const { createTmpDir } = require('../../src/tmp');
const saveBlueprintFile = require('../../src/save-blueprint-file');

describe(saveBlueprintFile, function() {
  let tmpPath;

  beforeEach(async function() {
    tmpPath = await createTmpDir();
  });

  it('works', async function() {
    let emberCliUpdateJsonPath = path.join(tmpPath, 'ember-cli-update.json');

    await saveBlueprintFile(emberCliUpdateJsonPath, {
      schemaVersion: '1.0.0',
      blueprints: [
        {
          packageName: 'test-blueprint',
          name: 'test-blueprint',
          location: '../test-blueprint',
          version: '0.0.1',
          outputRepo: 'https://github.com/test/output-repo',
          codemodsSource: 'test-codemods',
          isBaseBlueprint: true,
          // removes empty options
          options: []
        }
      ]
    });

    expect(emberCliUpdateJsonPath).to.be.a.file()
      .and.equal('test/fixtures/ember-cli-update-json/normal/ember-cli-update.json');
  });
});
