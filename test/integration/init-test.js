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
  assertNoStaged,
  assertNoUnstaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');

describe(init, function() {
  this.timeout(5 * 60 * 1000);

  let cwd;
  let tmpPath;

  before(function() {
    cwd = process.cwd();
  });

  afterEach(function() {
    process.chdir(cwd);
  });

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

    process.chdir(tmpPath);

    let { promise } = await init({
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
    let expected = path.join(cwd, mergeFixtures);

    _fixtureCompare({
      expect,
      actual,
      expected
    });
  }

  it('can reset a custom blueprint', async function() {
    let [
      {
        packageName
      },
      {
        location,
        options,
        codemodsSource,
        version: to
      }
    ] = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/reset/my-app/config/ember-cli-update.json')).blueprints;

    await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/init',
      commitMessage: 'my-app',
      blueprint: packageName
    });

    let commitMessage = 'base init';

    await commit({ m: commitMessage });

    await initBlueprint({
      fixturesPath: path.resolve(__dirname, '../fixtures/blueprint/app/local'),
      resolvedFrom: tmpPath,
      relativeDir: location
    });

    let {
      status
    } = await processExit({
      promise: init({
        reset: true,
        blueprint: location,
        to,
        codemodsSource,
        blueprintOptions: options
      }),
      cwd: tmpPath,
      commitMessage,
      expect
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/app/local-app/reset/my-app'
    });

    assertNoStaged(status);
  });

  it('can initialize a custom blueprint', async function() {
    let [
      {
        packageName
      },
      {
        location,
        codemodsSource,
        options
      }
    ] = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/merge/my-app/config/ember-cli-update.json')).blueprints;

    await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/init',
      commitMessage: 'my-app',
      blueprint: packageName
    });

    let commitMessage = 'base init';

    await commit({ m: commitMessage });

    await initBlueprint({
      fixturesPath: path.resolve(__dirname, '../fixtures/blueprint/app/local'),
      resolvedFrom: tmpPath,
      relativeDir: location
    });

    let {
      status
    } = await processExit({
      promise: init({
        blueprint: location,
        codemodsSource,
        blueprintOptions: options
      }),
      cwd: tmpPath,
      commitMessage,
      expect
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/app/local-app/merge/my-app'
    });

    assertNoUnstaged(status);
  });
});
