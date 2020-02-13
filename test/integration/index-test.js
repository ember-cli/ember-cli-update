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
const utils = require('boilerplate-update/src/utils');
const {
  assertNoUnstaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const { defaultTo } = require('../../src/constants');

describe(function() {
  this.timeout(30 * 1000);

  let tmpPath;

  afterEach(function() {
    sinon.restore();
  });

  async function merge({
    fixturesPath,
    dirty,
    blueprint,
    from,
    to = '3.11.0-beta.1',
    reset,
    compareOnly,
    runCodemods,
    codemodsJson,
    listCodemods,
    createCustomDiff,
    commitMessage,
    beforeMerge = () => Promise.resolve(),
    afterMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath,
      commitMessage,
      dirty
    });

    await beforeMerge();

    let promise = (async() => {
      let result = await (await emberCliUpdate({
        cwd: tmpPath,
        blueprint,
        from,
        to,
        reset,
        compareOnly,
        runCodemods,
        codemodsJson,
        listCodemods,
        createCustomDiff
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

  it('opens compare url', async function() {
    let open = sinon.stub(utils, 'open');

    let {
      result
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      compareOnly: true
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(result, 'don\'t accidentally print anything to the console').to.be.undefined;

    expect(open).to.have.been.calledOnce
      .and.to.have.been.calledWith('https://github.com/ember-cli/ember-new-output/compare/v2.11.1...v3.11.0-beta.1');
  });

  it('lists codemods', async function() {
    let {
      result
    } = await merge({
      fixturesPath: 'test/fixtures/codemod/local',
      commitMessage: 'my-app',
      listCodemods: true
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    // I'm not asserting the entire list because it can be different
    // depending on which node version the tests are running under.
    expect(JSON.parse(result)).to.have.own.property('ember-modules-codemod');
  });

  it('accepts codemods via json string', async function() {
    let {
      result
    } = await merge({
      fixturesPath: 'test/fixtures/codemod/local',
      commitMessage: 'my-app',
      listCodemods: true,
      codemodsJson: JSON.stringify({
        'test-codemod-json': {
          versions: {
            lodash: '3.0.0'
          },
          projectOptions: ['test-project', 'unused'],
          nodeVersion: '6.0.0',
          commands: []
        }
      })
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(JSON.parse(result)).to.have.own.property('test-codemod-json');
  });

  it('can create a personal diff instead of using an output repo - app', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/custom/app/local',
      commitMessage: 'my-custom-app',
      createCustomDiff: true
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/custom/app/merge/my-custom-app'
    });

    assertNoUnstaged(status);
  });

  it('can create a personal diff instead of using an output repo - addon', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/custom/addon/local',
      commitMessage: 'my-custom-addon',
      createCustomDiff: true
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/custom/addon/merge/my-custom-addon'
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
