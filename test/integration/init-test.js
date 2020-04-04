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

describe(init, function() {
  this.timeout(30 * 1000);

  let tmpPath;

  async function merge({
    fixturesPath,
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
});
