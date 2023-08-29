'use strict';

const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processExit,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const init = require('../../src/init');
const {
  assertNoStaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const {
  defaultPackageName,
  defaultAppBlueprintName
} = require('../../src/constants');

describe(init, function() {
  this.timeout(60e3);

  let tmpPath;

  async function merge({
    fixturesPath,
    packageName,
    blueprint,
    to,
    outputRepo,
    codemodsSource,
    blueprintOptions,
    commitMessage,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath
    });

    await beforeMerge();

    let { promise } = await init({
      cwd: tmpPath,
      packageName,
      blueprint,
      to,
      outputRepo,
      codemodsSource,
      blueprintOptions
    });

    return await processExit({
      promise,
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  function fixtureCompare({
    mergeFixtures
  }) {
    let actual = tmpPath;
    let expected = mergeFixtures;

    _fixtureCompare({
      expect,
      actual,
      expected
    });
  }

  it('can initialize a custom blueprint', async function() {
    let {
      location,
      outputRepo,
      codemodsSource,
      options
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/init/merge/my-app/config/ember-cli-update.json')).blueprints[0];

    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/init/local',
      commitMessage: 'my-app',
      blueprint: location,
      outputRepo,
      codemodsSource,
      blueprintOptions: options,
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: path.resolve(__dirname, '../fixtures/blueprint/app/local'),
          resolvedFrom: tmpPath,
          relativeDir: location
        });
      }
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/app/local-app/init/merge/my-app'
    });

    assertNoStaged(status);
  });

  it('can initialize a default blueprint by name', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      packageName: defaultPackageName,
      blueprint: defaultAppBlueprintName,
      to: '2.11.1'
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/init/my-app'
    });

    assertNoStaged(status);
  });
});
