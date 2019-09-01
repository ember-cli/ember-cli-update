'use strict';

const fs = require('fs-extra');
const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processExit,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const install = require('../../src/install');
const run = require('../../src/run');
const {
  assertNoStaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');

describe(install, function() {
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
    addon,
    commitMessage,
    beforeMerge = () => Promise.resolve(),
    afterMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath,
      commitMessage
    });

    await beforeMerge();

    process.chdir(tmpPath);

    let promise = (async() => {
      let result = await install({
        addon
      });

      await afterMerge();

      return result;
    })();

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

  it('can install an addon with a default blueprint and a state file', async function() {
    let {
      location
    } = require('../fixtures/blueprint/addon/legacy-app/merge/ideal/my-app/config/ember-cli-update').blueprints[0];

    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/addon/legacy-app/local/ideal',
      commitMessage: 'my-app',
      addon: location,
      async beforeMerge() {
        await initBlueprint('test/fixtures/blueprint/addon/legacy', location);

        await run('npm install', { cwd: tmpPath });
      },
      async afterMerge() {
        await fs.remove('package-lock.json');
      }
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/addon/legacy-app/merge/ideal/my-app'
    });

    assertNoStaged(status);
  });
});
