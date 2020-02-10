'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processExit
} = require('git-fixtures');
const stats = require('../../src/stats');
const {
  assertNoStaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');

describe(stats, function() {
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
    blueprint,
    fixturesPath,
    commitMessage,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath,
      commitMessage
    });

    await beforeMerge();

    process.chdir(tmpPath);

    let promise = stats({
      blueprint
    });

    return await processExit({
      promise,
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  it('works', async function() {
    let [
      {
        packageName: packageName1,
        version: from1
      },
      {
        packageName: packageName2,
        location,
        version: from2
      }
    ] = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/local/my-app/config/ember-cli-update.json')).blueprints;

    let [
      {
        version: to1
      },
      {
        version: to2
      }
    ] = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/merge/my-app/config/ember-cli-update.json')).blueprints;

    let {
      result,
      status
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/local',
      commitMessage: 'my-app',
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: 'test/fixtures/blueprint/app/local',
          resolvedFrom: tmpPath,
          relativeDir: location
        });
      }
    });

    assertNoStaged(status);

    expect(result).to.equal(`${packageName1}, current: ${from1}, latest: ${to1}
${packageName2}, current: ${from2}, latest: ${to2}`);
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
});
