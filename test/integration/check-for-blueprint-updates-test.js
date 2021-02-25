'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const checkForBlueprintUpdates = require('../../src/check-for-blueprint-updates');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const { createTmpDir } = require('../../src/tmp');

describe(checkForBlueprintUpdates, function() {
  this.timeout(30e3);

  let tmpPath;

  beforeEach(async function() {
    tmpPath = await createTmpDir();
  });

  it('works', async function() {
    // out of date test
    let localBlueprint = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/local/my-app/config/ember-cli-update.json')).blueprints[1];
    let urlBlueprint = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/remote-app/local/my.app/config/ember-cli-update.json')).blueprints[0];

    // up to date test
    let npmBlueprint = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/npm-app/merge/my-app/config/ember-cli-update.json')).blueprints[1];

    await initBlueprint({
      fixturesPath: 'test/fixtures/blueprint/app/local',
      resolvedFrom: tmpPath,
      relativeDir: localBlueprint.location
    });

    let blueprintUpdates = await checkForBlueprintUpdates({
      cwd: tmpPath,
      blueprints: [
        localBlueprint,
        urlBlueprint,
        npmBlueprint
      ]
    });

    expect(blueprintUpdates).to.deep.equal([
      {
        blueprint: localBlueprint,
        latestVersion: (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/merge/my-app/config/ember-cli-update.json')).blueprints[1].version,
        isUpToDate: false
      },
      {
        blueprint: urlBlueprint,
        latestVersion: (await loadSafeBlueprintFile('test/fixtures/blueprint/app/remote-app/merge/my.app/config/ember-cli-update.json')).blueprints[0].version,
        isUpToDate: false
      },
      {
        blueprint: npmBlueprint,
        latestVersion: npmBlueprint.version,
        isUpToDate: true
      }
    ]);
  });
});
