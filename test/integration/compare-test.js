'use strict';

const fs = require('fs-extra');
const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processExit,
  commit
} = require('git-fixtures');
const { isGitClean } = require('git-diff-apply');
const compare = require('../../src/compare');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const utils = require('boilerplate-update/src/utils');
const sinon = require('sinon');
const inquirer = require('inquirer');

describe(compare, function() {
  this.timeout(30 * 1000);

  let tmpPath;
  let open;

  beforeEach(function() {
    open = sinon.stub(utils, 'open');
  });

  afterEach(function() {
    sinon.restore();
  });

  async function merge({
    blueprint,
    to = '3.11.0-beta.1',
    fixturesPath,
    commitMessage,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath
    });

    await beforeMerge();

    let promise = compare({
      cwd: tmpPath,
      blueprint,
      to
    });

    return await processExit({
      promise,
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  it('works', async function() {
    let {
      location
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/local/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      version: to
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/merge/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      result
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/local',
      commitMessage: 'my-app',
      blueprint: location,
      to,
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: path.resolve(__dirname, '../fixtures/blueprint/app/local'),
          resolvedFrom: tmpPath,
          relativeDir: location
        });
      }
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(result, 'don\'t accidentally print anything to the console').to.be.undefined;

    expect(open).to.have.been.calledOnce
      .and.to.have.been.calledWith('https://github.com/test/output-repo/compare/v0.0.1...v0.0.2');
  });

  it('handles missing blueprint', async function() {
    let {
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/local',
      commitMessage: 'my-app',
      blueprint: 'missing'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(stderr).to.equal('blueprint "missing" was not found');
  });

  it('works for the default blueprint without a state file', async function() {
    await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(open).to.have.been.calledOnce
      .and.to.have.been.calledWith('https://github.com/ember-cli/ember-new-output/compare/v2.11.1...v3.11.0-beta.1');
  });

  it('works for the default blueprint with a state file', async function() {
    sinon.stub(inquirer, 'prompt').withArgs([{
      type: 'list',
      message: 'Which blueprint would you like to compare?',
      name: 'blueprint',
      choices: [{ name: 'ember-cli' }]
    }]).resolves({ blueprint: 'ember-cli' });

    let commitMessage = 'my-app';

    await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage,
      async beforeMerge() {
        await fs.copy(
          path.resolve(__dirname, '../fixtures/ember-cli-update-json/default/config/ember-cli-update.json'),
          path.join(tmpPath, 'config/ember-cli-update.json')
        );

        await commit({ m: commitMessage, cwd: tmpPath });
      }
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(open).to.have.been.calledOnce
      .and.to.have.been.calledWith('https://github.com/ember-cli/ember-new-output/compare/v2.11.1...v3.11.0-beta.1');
  });
});
