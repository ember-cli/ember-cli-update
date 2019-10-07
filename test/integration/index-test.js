'use strict';

const fs = require('fs-extra');
const path = require('path');
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
  assertNoUnstaged,
  assertNoStaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');

const toDefault = require('../../src/args').to.default;

describe(function() {
  this.timeout(30 * 1000);

  let cwd;
  let sandbox;
  let tmpPath;

  before(function() {
    cwd = process.cwd();
  });

  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();

    process.chdir(cwd);
  });

  async function merge({
    fixturesPath,
    dirty,
    blueprint,
    from,
    to = '3.2.0-beta.1',
    reset,
    compareOnly,
    statsOnly,
    runCodemods,
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

    process.chdir(tmpPath);

    let promise = (async() => {
      let result = await emberCliUpdate({
        blueprint,
        from,
        to,
        reset,
        compareOnly,
        statsOnly,
        runCodemods,
        listCodemods,
        createCustomDiff
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

  it('resets app', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      reset: true,
      // test the resetting logic of ember-cli-update.json
      blueprint: 'ember-cli',
      async afterMerge() {
        expect(path.join(tmpPath, 'config/ember-cli-update.json')).to.be.a.file()
          .and.equal(path.join(cwd, 'test/fixtures/ember-cli-update-json/default/config/ember-cli-update.json'));

        await fs.remove(path.join(tmpPath, 'config/ember-cli-update.json'));
      }
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/reset/my-app'
    });

    expect(status).to.match(/^ D app\/controllers\/application\.js$/m);

    assertNoStaged(status);
  });

  it('opens compare url', async function() {
    let open = sandbox.stub(utils, 'open');

    let {
      result,
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      compareOnly: true
    });

    assertNoUnstaged(status);

    expect(result, 'don\'t accidentally print anything to the console').to.be.undefined;

    expect(open).to.have.been.calledOnce
      .and.to.have.been.calledWith('https://github.com/ember-cli/ember-new-output/compare/v2.11.1...v3.2.0-beta.1');
  });

  it('resolves semver ranges', async function() {
    let {
      result
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      from: '1.13',
      to: '^2',
      statsOnly: true
    });

    expect(result).to.equal(`project options: app, welcome
from version: 1.13.15
to version: 2.18.2
output repo: https://github.com/ember-cli/ember-new-output
applicable codemods: `);
  });

  it('shows stats only', async function() {
    let {
      result,
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/merge',
      commitMessage: 'my-app',
      to: '3.3.0',
      statsOnly: true
    });

    assertNoStaged(status);

    expect(result).to.equal(`project options: app, welcome
from version: 3.2.0-beta.1
to version: 3.3.0
output repo: https://github.com/ember-cli/ember-new-output
applicable codemods: ember-modules-codemod, ember-qunit-codemod, ember-test-helpers-codemod, es5-getter-ember-codemod, notify-property-change, qunit-dom-codemod`);
  });

  it('lists codemods', async function() {
    let {
      result,
      status
    } = await merge({
      fixturesPath: 'test/fixtures/codemod/local',
      commitMessage: 'my-app',
      listCodemods: true
    });

    assertNoStaged(status);

    // I'm not asserting the entire list because it can be different
    // depending on which node version the tests are running under.
    expect(JSON.parse(result)).to.have.own.property('ember-modules-codemod');
  });

  it('can create a personal diff instead of using an output repo - app', async function() {
    this.timeout(5 * 60 * 1000);

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
    this.timeout(5 * 60 * 1000);

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
    this.timeout(10 * 60 * 1000);

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
        } = require('../fixtures/blueprint/app/legacy-app/merge/my-app/config2/ember-cli-update').blueprints[0];

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/blueprint/app/legacy-app/local',
          commitMessage: 'my-app',
          blueprint: location,
          to,
          async beforeMerge() {
            await initBlueprint('test/fixtures/blueprint/app/legacy', location);
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
        } = require('../fixtures/blueprint/app/remote-app/merge/my-app/config/ember-cli-update').blueprints[0];

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/blueprint/app/remote-app/local',
          commitMessage: 'my-app',
          blueprint: name,
          to
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/blueprint/app/remote-app/merge/my-app'
        });

        assertNoUnstaged(status);
      });

      it('can update an npm blueprint', async function() {
        let {
          name
        } = require('../fixtures/blueprint/app/npm-app/merge/my-app/config/ember-cli-update').blueprints[0];

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/blueprint/app/npm-app/local',
          commitMessage: 'my-app',
          blueprint: name,
          to: toDefault
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/blueprint/app/npm-app/merge/my-app'
        });

        assertNoUnstaged(status);
      });

      it('can update a legacy addon blueprint', async function() {
        let {
          name,
          location
        } = require('../fixtures/blueprint/addon/legacy-app/local/ideal/my-app/config/ember-cli-update').blueprints[0];

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/blueprint/addon/legacy-app/local/ideal',
          commitMessage: 'my-app',
          blueprint: name,
          to: toDefault,
          async beforeMerge() {
            await initBlueprint('test/fixtures/blueprint/addon/legacy', location);
          }
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/blueprint/addon/legacy-app/merge/ideal/my-app'
        });

        assertNoUnstaged(status);
      });
    });
  });
});
