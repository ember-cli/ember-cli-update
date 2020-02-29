'use strict';

const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processExit,
  fixtureCompare: _fixtureCompare,
  commit
} = require('git-fixtures');
const init = require('../../src/init');
const {
  assertNoUnstaged
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
    blueprintOptions,
    commitMessage,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath,
      commitMessage
    });

    await beforeMerge();

    let { promise } = await init({
      cwd: tmpPath,
      blueprint,
      to,
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
    let [
      {
        packageName
      },
      {
        location,
        outputRepo,
        codemodsSource,
        options
      }
    ] = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/init/merge/my-app/config/ember-cli-update.json')).blueprints;

    await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/init/local',
      commitMessage: 'my-app',
      blueprint: packageName
    });

    let commitMessage = 'base init';

    await commit({ m: commitMessage, cwd: tmpPath });

    await initBlueprint({
      fixturesPath: path.resolve(__dirname, '../fixtures/blueprint/app/local'),
      resolvedFrom: tmpPath,
      relativeDir: location
    });

    let { promise } = await init({
      cwd: tmpPath,
      blueprint: location,
      outputRepo,
      codemodsSource,
      blueprintOptions: options
    });

    let {
      status
    } = await processExit({
      promise,
      cwd: tmpPath,
      commitMessage,
      expect
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/app/local-app/init/merge/my-app'
    });

    assertNoUnstaged(status);
  });
});
