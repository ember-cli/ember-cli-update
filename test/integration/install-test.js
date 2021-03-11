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
const { spawn } = require('../../src/run');
const {
  assertNoStaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');

describe(install, function() {
  this.timeout(60e3);

  let tmpPath;

  async function merge({
    fixturesPath,
    addon,
    commitMessage,
    blueprintName,
    beforeMerge = () => Promise.resolve(),
    afterMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath
    });

    await beforeMerge();

    let promise = (async() => {
      let result = await install({
        cwd: tmpPath,
        addon,
        blueprint: blueprintName
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

        await spawn('npm', ['install'], { cwd: tmpPath });
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

  it('can install an addon with a custom default blueprint selected', async function() {
    let {
      location
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/addon/legacy-app/merge/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      status
    } = await merge({
      blueprintName: 'custom-blueprint',
      fixturesPath: 'test/fixtures/blueprint/addon/legacy-app/local/no-addon',
      commitMessage: 'my-app',
      addon: location,
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: 'test/fixtures/blueprint/addon/legacy',
          resolvedFrom: tmpPath,
          relativeDir: location
        });

        await spawn('npm', ['install'], { cwd: tmpPath });
      },
      async afterMerge() {
        await fs.remove(path.join(tmpPath, 'package-lock.json'));
      }
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/addon/legacy-app/merge/my-app-generated-custom-blueprint'
    });

    assertNoStaged(status);
  });

  it('can install an addon with a custom blueprint that does not match package name', async function() {
    let addonContainingBlueprint = 'test/fixtures/blueprint/addon/default-blueprint-different-than-name';
    let {
      location
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/addon/legacy-app/merge/my-app-install-blueprint-different-than-name/config/ember-cli-update.json')).blueprints[1];

    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/addon/legacy-app/local/no-addon',
      commitMessage: 'my-app',
      addon: location,
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: addonContainingBlueprint,
          resolvedFrom: tmpPath,
          relativeDir: location
        });

        await spawn('npm', ['install'], { cwd: tmpPath });
      },
      async afterMerge() {
        await fs.remove(path.join(tmpPath, 'package-lock.json'));
      }
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/addon/legacy-app/merge/my-app-install-blueprint-different-than-name'
    });

    assertNoStaged(status);
  });
});
