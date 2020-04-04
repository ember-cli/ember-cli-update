'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const sinon = require('sinon');
const {
  buildTmp,
  processExit,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const { isGitClean } = require('git-diff-apply');
const emberCliUpdate = require('../../src');
const {
  assertNoUnstaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const {
  defaultPackageName,
  defaultAddonBlueprintName,
  defaultTo
} = require('../../src/constants');

describe(function() {
  this.timeout(30 * 1000);

  let tmpPath;

  afterEach(function() {
    sinon.restore();
  });

  async function merge({
    fixturesPath,
    dirty,
    packageName,
    blueprint,
    from,
    to = '3.11.0-beta.1',
    commitMessage,
    beforeMerge = () => Promise.resolve(),
    afterMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath,
      dirty
    });

    await beforeMerge();

    let promise = (async() => {
      let result = await (await emberCliUpdate({
        cwd: tmpPath,
        packageName,
        blueprint,
        from,
        to
      })).promise;

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

  it('handles dirty', async function() {
    let {
      status,
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      dirty: true
    });

    expect(status).to.equal(`?? a-random-new-file
`);

    expect(stderr).to.contain('You must start with a clean working directory');
    expect(stderr).to.not.contain('UnhandledPromiseRejectionWarning');
  });

  it('handles non-ember-cli app', async function() {
    let promise = merge({
      fixturesPath: 'test/fixtures/package-json/non-ember-cli',
      commitMessage: 'my-app'
    });

    await expect(promise)
      .to.eventually.be.rejectedWith('Ember CLI project type could not be determined');

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;
  });

  it('handles non-npm dir', async function() {
    let {
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/package-json/missing',
      commitMessage: 'my-app'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(stderr).to.contain('No package.json was found in this directory');
  });

  it('handles malformed package.json', async function() {
    let {
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/package-json/malformed',
      commitMessage: 'my-app'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(stderr).to.contain('The package.json is malformed');
  });

  it('updates glimmer app', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/glimmer/local',
      commitMessage: 'glimmer-app',
      from: '0.5.0',
      to: '0.6.1'
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/glimmer/merge/glimmer-app'
    });

    expect(status).to.match(/^M {2}src\/index\.ts$/m);

    assertNoUnstaged(status);
  });

  it('needs --from if glimmer app before 0.6.3', async function() {
    let {
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/glimmer/local',
      commitMessage: 'glimmer-app',
      to: '0.6.1'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(stderr).to.contain('version cannot be determined');
  });

  it('updates addon', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/addon/local',
      commitMessage: 'my-addon'
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/addon/merge/my-addon'
    });

    assertNoUnstaged(status);
  });

  describe('blueprints', function() {
    describe('--blueprint', function() {
      it('throws if missing --from', async function() {
        let promise = merge({
          fixturesPath: 'test/fixtures/app/local',
          commitMessage: 'my-app',
          blueprint: 'test-blueprint'
        });

        await expect(promise).to.eventually.be.rejectedWith('A custom blueprint cannot detect --from. You must supply it.');

        expect(await isGitClean({ cwd: tmpPath })).to.be.ok;
      });

      it('can update a legacy blueprint', async function() {
        let {
          location,
          version: to
        } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/legacy-app/merge/my-app/config2/ember-cli-update.json')).blueprints[1];

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/blueprint/app/legacy-app/local',
          commitMessage: 'my-app',
          blueprint: location,
          to,
          async beforeMerge() {
            await initBlueprint({
              fixturesPath: 'test/fixtures/blueprint/app/legacy',
              resolvedFrom: tmpPath,
              relativeDir: location
            });
          }
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/blueprint/app/legacy-app/merge/my-app'
        });

        assertNoUnstaged(status);
      });

      it('can update a default blueprint by name', async function() {
        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/addon/local',
          commitMessage: 'my-addon',
          packageName: defaultPackageName,
          blueprint: defaultAddonBlueprintName
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/addon/merge/my-addon'
        });

        assertNoUnstaged(status);
      });
    });

    describe('ember-cli-update.json', function() {
      it('can update a remote blueprint', async function() {
        let {
          name,
          version: to
        } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/remote-app/merge/my.app/config/ember-cli-update.json')).blueprints[0];

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/blueprint/app/remote-app/local',
          commitMessage: 'my.app',
          blueprint: name,
          to
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/blueprint/app/remote-app/merge/my.app'
        });

        assertNoUnstaged(status);
      });

      it('can update an npm blueprint', async function() {
        let [
          {
            location
          },
          {
            name
          }
        ] = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/npm-app/merge/my-app/config/ember-cli-update.json')).blueprints;

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/blueprint/app/npm-app/local',
          commitMessage: 'my-app',
          blueprint: name,
          to: defaultTo,
          async beforeMerge() {
            // test local base blueprints
            await initBlueprint({
              fixturesPath: 'test/fixtures/blueprint/app/local',
              resolvedFrom: tmpPath,
              relativeDir: location
            });
          }
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/blueprint/app/npm-app/merge/my-app'
        });

        assertNoUnstaged(status);
      });
    });
  });
});
