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
  assertNoUnstaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');

const toDefault = require('../../src/args').to.default;

describe(init, function() {
  this.timeout(3 * 60 * 1000);

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
    to = toDefault,
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

    let promise = init({
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

  it('can initialize a custom blueprint', async function() {
    let {
      location
    } = require('../fixtures/blueprint/app/local-app/merge/my-app/config/ember-cli-update').blueprints[1];

    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/local',
      commitMessage: 'my-app',
      blueprint: location,
      blueprintOptions: ['--supplied-option=foo'],
      async beforeMerge() {
        await initBlueprint('test/fixtures/blueprint/app/local', location);
      }
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/app/local-app/merge/my-app'
    });

    assertNoUnstaged(status);
  });
});
