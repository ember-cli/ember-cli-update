'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processExit
} = require('git-fixtures');
const { isGitClean } = require('git-diff-apply');
const stats = require('../../src/stats');
const {
  assertNoStaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const utils = require('../../src/utils');
const sinon = require('sinon');

describe(stats, function() {
  this.timeout(30 * 1000);

  let tmpPath;

  afterEach(function() {
    sinon.restore();
  });

  async function merge({
    blueprint,
    fixturesPath,
    commitMessage,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath
    });

    await beforeMerge();

    let promise = stats({
      cwd: tmpPath,
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
        name: blueprintName1,
        version: from1
      },
      {
        packageName: packageName2,
        name: blueprintName2,
        location,
        version: from2,
        outputRepo,
        codemodsSource,
        options
      }
    ] = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/local/my-app/config/ember-cli-update.json')).blueprints;

    sinon.stub(utils, 'getApplicableCodemods').withArgs({
      source: codemodsSource,
      projectOptions: options,
      packageJson: require('../fixtures/blueprint/app/local-app/local/my-app/package')
    }).resolves({
      testCodemod1: {},
      testCodemod2: {}
    });

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

    expect(result).to.equal(`package name: ${packageName1}
blueprint name: ${blueprintName1}
current version: ${from1}
latest version: ${to1}

package name: ${packageName2}
package location: ${location}
blueprint name: ${blueprintName2}
current version: ${from2}
latest version: ${to2}
output repo: ${outputRepo}
options: ${options[0]}
codemods source: ${codemodsSource}
applicable codemods: testCodemod1, testCodemod2`);
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

  it('handles no blueprints', async function() {
    let {
      stderr,
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app'
    });

    assertNoStaged(status);

    expect(stderr).to.equal('no blueprints found');
  });

  it('works for the default blueprint', async function() {
    sinon.stub(utils, 'getVersions').withArgs('ember-cli').resolves(['3.15.0']);

    let {
      result
    } = await merge({
      fixturesPath: 'test/fixtures/app/merge',
      commitMessage: 'my-app'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(result).to.equal(`package name: ember-cli
blueprint name: app
current version: 3.11.0-beta.1
latest version: 3.15.0
output repo: https://github.com/ember-cli/ember-new-output
codemods source: ember-app-codemods-manifest@1
applicable codemods: ember-modules-codemod, ember-qunit-codemod, ember-test-helpers-codemod, es5-getter-ember-codemod, notify-property-change, qunit-dom-codemod, deprecate-merge-codemod, deprecate-router-events-codemod, cp-property-codemod, cp-volatile-codemod, cp-property-map-codemod, ember-angle-brackets-codemod, ember-data-codemod`);
  });
});
