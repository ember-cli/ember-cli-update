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
  assertNoUnstaged
} = require('../helpers/assertions');
const mutatePackageJson = require('boilerplate-update/src/mutate-package-json');
const getBlueprintFilePath = require('../../src/get-blueprint-file-path');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const saveBlueprintFile = require('../../src/save-blueprint-file');

describe(function() {
  this.timeout(60 * 1000);

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
          pkg.devDependencies = {
            'ember-cli': pkg.devDependencies['ember-cli'],
            'ember-cli-update': '',
            'ember-welcome-page': ''
          };
        });

        let nodeModules = path.join(tmpPath, 'node_modules');
        await fs.ensureDir(nodeModules);
        await fs.symlink(
          path.resolve(__dirname, '../..'),
          path.join(nodeModules, 'ember-cli-update')
        );
        await fs.symlink(
          path.resolve(path.dirname(require.resolve('ember-cli')), '../..'),
          path.join(nodeModules, 'ember-cli')
        );

        await commit({
          m: 'my-app',
          cwd: tmpPath
        });
      }
    });

    await mutatePackageJson(tmpPath, pkg => {
      // The tradeoff of not npm installing is we don't get to
      // test real dep upgrades, which is acceptable for the
      // ember addon method.
      pkg.devDependencies = require('../fixtures/app/merge/my-app/package').devDependencies;
    });

    let emberCliUpdateJsonPath = await getBlueprintFilePath(tmpPath);

    let emberCliUpdateJson = await loadSafeBlueprintFile(emberCliUpdateJsonPath);

    // remove --no-welcome
    emberCliUpdateJson.blueprints[0].options = [];

    await saveBlueprintFile(emberCliUpdateJsonPath, emberCliUpdateJson);

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });

    assertNoUnstaged(status);
  });
});
