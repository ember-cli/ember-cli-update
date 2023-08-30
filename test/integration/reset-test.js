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
const sinon = require('sinon');
const inquirer = require('inquirer');

describe(reset, function() {
  this.timeout(60e3);

  let tmpPath;

  async function merge({
    fixturesPath,
    packageName,
    blueprint,
    to,
    commitMessage,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath
    });

    await beforeMerge();

    let { promise } = await reset({
      cwd: tmpPath,
      packageName,
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
    let expected = mergeFixtures;

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

  it('can reset the default blueprint without a state file', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      to: '2.11.1'
    });

    expect(status).to.match(/^ D app\/controllers\/application\.js$/m);

    assertNoStaged(status);

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/reset/my-app'
    });
  });

  it('can reset the default blueprint with a state file', async function() {
    sinon.stub(inquirer, 'prompt').withArgs([{
      type: 'list',
      message: 'Which blueprint would you like to reset?',
      name: 'blueprint',
      choices: [{ name: 'ember-cli' }]
    }]).resolves({ blueprint: 'ember-cli' });

    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/merge',
      commitMessage: 'my-app',
      to: '2.11.1'
    });

    expect(status).to.match(/^ D app\/controllers\/application\.js$/m);

    assertNoStaged(status);

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/reset/my-app'
    });
  });

  it('can reset a default blueprint by name', async function() {
    let {
      packageName,
      name: blueprint,
      version: to
    } = (await loadSafeBlueprintFile('test/fixtures/app/reset/my-app/config/ember-cli-update.json')).blueprints[0];

    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/merge',
      commitMessage: 'my-app',
      packageName,
      blueprint,
      to
    });

    assertNoStaged(status);

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/reset/my-app'
    });
  });
});
