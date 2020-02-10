'use strict';

const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processExit,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const reset = require('../../src/reset');
const {
  assertNoStaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');

describe(reset, function() {
  this.timeout(30 * 1000);

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
    commitMessage,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath,
      commitMessage
    });

    await beforeMerge();

    process.chdir(tmpPath);

    let { promise } = await reset({
      blueprint,
      to
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
    let {
      location
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/reset/local/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      version: to
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/reset/merge/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/reset/local',
      commitMessage: 'my-app',
      blueprint: location,
      to,
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: path.resolve(__dirname, '../fixtures/blueprint/app/local'),
          resolvedFrom: tmpPath,
          relativeDir: location
        });
      }
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/app/local-app/reset/merge/my-app'
    });

    assertNoStaged(status);
  });

  it('handles missing blueprint', async function() {
    let {
      stderr,
      status
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/local',
      commitMessage: 'my-app',
      blueprint: 'missing'
    });

    assertNoStaged(status);

    expect(stderr).to.equal('blueprint "missing" was not found');
  });

  it('handles no blueprints', async function() {
    let {
      stderr,
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app'
    });

    assertNoStaged(status);

    expect(stderr).to.equal('no blueprints found');
  });
});
