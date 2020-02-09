'use strict';

const fs = require('fs-extra');
const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  commit,
  processBin,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const {
  assertNormalUpdate,
  assertNoUnstaged
} = require('../helpers/assertions');
const run = require('../../src/run');
const mutatePackageJson = require('boilerplate-update/src/mutate-package-json');

describe(function() {
  this.timeout(3 * 60 * 1000);

  let tmpPath;

  async function merge({
    fixturesPath,
    to = '3.11.0-beta.1',
    commitMessage,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath
    });

    await beforeMerge();

    return await (await processBin({
      bin: 'ember',
      args: [
        'update',
        `--to=${to}`,
        '--resolve-conflicts'
      ],
      cwd: tmpPath,
      commitMessage,
      expect
    })).promise;
  }

  function fixtureCompare({
    actual = tmpPath,
    mergeFixtures
  }) {
    let expected = mergeFixtures;

    _fixtureCompare({
      expect,
      actual,
      expected
    });
  }

  it('works', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      async beforeMerge() {
        await mutatePackageJson(tmpPath, pkg => {
          pkg.devDependencies['ember-cli-update'] = '';
        });

        let nodeModules = path.join(tmpPath, 'node_modules');
        await fs.ensureDir(nodeModules);
        await fs.symlink(
          path.resolve(__dirname, '../..'),
          path.join(nodeModules, 'ember-cli-update')
        );

        await run('npm install --no-package-lock', { cwd: tmpPath });

        await commit({
          m: 'my-app',
          cwd: tmpPath
        });
      }
    });

    await mutatePackageJson(tmpPath, pkg => {
      // remove addon because it's not in the fixtures
      delete pkg.devDependencies['ember-cli-update'];
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  });
});
