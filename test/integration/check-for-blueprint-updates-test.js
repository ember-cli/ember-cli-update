'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const checkForBlueprintUpdates = require('../../src/check-for-blueprint-updates');
const { initBlueprint } = require('../helpers/blueprint');

describe(checkForBlueprintUpdates, function() {
  this.timeout(30 * 1000);

  let cwd = process.cwd();

  afterEach(function() {
    process.chdir(cwd);
  });

  it('works', async function() {
    // out of date test
    let localBlueprint = require('../fixtures/blueprint/app/local-app/local/my-app/ember-cli-update').blueprints[0];
    let urlBlueprint = require('../fixtures/blueprint/app/remote-app/local/my-app/ember-cli-update').blueprints[0];

    // up to date test
    let npmBlueprint = require('../fixtures/blueprint/app/npm-app/merge/my-app/ember-cli-update').blueprints[0];

    let blueprintPath = await initBlueprint('test/fixtures/blueprint/app/local', localBlueprint.location);

    process.chdir(blueprintPath);

    let blueprintUpdates = await checkForBlueprintUpdates([
      localBlueprint,
      urlBlueprint,
      npmBlueprint
    ]);

    expect(blueprintUpdates).to.deep.equal([
      {
        name: localBlueprint.name,
        currentVersion: localBlueprint.version,
        latestVersion: require('../fixtures/blueprint/app/local-app/merge/my-app/ember-cli-update').blueprints[0].version,
        isUpToDate: false
      },
      {
        name: urlBlueprint.name,
        currentVersion: urlBlueprint.version,
        latestVersion: require('../fixtures/blueprint/app/remote-app/merge/my-app/ember-cli-update').blueprints[0].version,
        isUpToDate: false
      },
      {
        name: npmBlueprint.name,
        currentVersion: npmBlueprint.version,
        latestVersion: npmBlueprint.version,
        isUpToDate: true
      }
    ]);
  });
});
