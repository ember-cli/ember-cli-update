'use strict';

const fs = require('fs-extra');
const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processBin,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const {
  assertNormalUpdate,
  assertNoUnstaged,
  assertCodemodRan
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');

describe(function() {
  this.timeout(30 * 1000);

  let tmpPath;

  async function merge({
    fixturesPath,
    to = '3.2.0-beta.1',
    runCodemods,
    subDir = '',
    commitMessage,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath,
      subDir
    });

    await beforeMerge();

    let args = [
      `--to=${to}`,
      '--resolve-conflicts'
    ];
    if (runCodemods) {
      args = [
        '--run-codemods'
      ];
    }

    return processBin({
      binFile: 'ember-cli-update',
      args,
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

  it('updates app', async function() {
    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  });

  it('updates addon', async function() {
    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/addon/local',
      commitMessage: 'my-addon'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/addon/merge/my-addon'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  });

  it('runs codemods', async function() {
    this.timeout(5 * 60 * 1000);

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/codemod/local',
      commitMessage: 'my-app',
      runCodemods: true
    });

    ps.stdout.on('data', data => {
      let str = data.toString();
      if (str.includes('These codemods apply to your project.')) {
        ps.stdin.write('a\n');
      }
    });

    let {
      status
    } = await promise;

    // file is indeterminent between OS's, so ignore
    await fs.remove(path.join(tmpPath, 'MODULE_REPORT.md'));

    let mergeFixtures = 'test/fixtures/codemod/latest-node/my-app';
    if (process.env.NODE_LTS) {
      mergeFixtures = 'test/fixtures/codemod/min-node/my-app';
    }

    fixtureCompare({
      mergeFixtures
    });

    assertNoUnstaged(status);
    assertCodemodRan(status);
  });

  it('scopes to sub dir if run from there', async function() {
    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      subDir: 'foo/bar'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  });

  it('can pick from multiple blueprints', async function() {
    this.timeout(3 * 60 * 1000);

    let {
      location
    } = require('../fixtures/local-blueprint-app/local/my-app/ember-cli-update').blueprints[0];

    let {
      version: to
    } = require('../fixtures/local-blueprint-app/merge/my-app/ember-cli-update').blueprints[0];

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/local-blueprint-app/local',
      commitMessage: 'my-app',
      to,
      async beforeMerge() {
        await initBlueprint('test/fixtures/local-blueprint', location);
      }
    });

    ps.stdout.on('data', data => {
      let str = data.toString();
      if (str.includes('Multiple blueprint updates have been found.')) {
        ps.stdin.write('\n');
      }
    });

    let {
      status
    } = await promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/local-blueprint-app/merge/my-app'
    });

    expect(status).to.match(/^M {2}.*ember-cli-update\.json$/m);

    assertNoUnstaged(status);
  });
});
