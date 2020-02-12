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
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');

describe(install, function() {
  this.timeout(60 * 1000);

  let tmpPath;

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

    let promise = (async() => {
      let result = await install({
        cwd: tmpPath,
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
    let expected = mergeFixtures;

    _fixtureCompare({
      expect,
      actual,
      expected
    });
  }

  it('can install an addon with a default blueprint and no state file', async function() {
    let {
      location
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/addon/legacy-app/merge/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/addon/legacy-app/local/no-addon',
      commitMessage: 'my-app',
      addon: location,
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: 'test/fixtures/blueprint/addon/legacy',
          resolvedFrom: tmpPath,
          relativeDir: location
        });

        await run('npm install', { cwd: tmpPath });
      },
      async afterMerge() {
        await fs.remove(path.join(tmpPath, 'package-lock.json'));
      }
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/addon/legacy-app/merge/my-app'
    });

    assertNoStaged(status);
  });
});
