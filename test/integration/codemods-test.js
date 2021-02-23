'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processExit
} = require('git-fixtures');
const { isGitClean } = require('git-diff-apply');
const codemods = require('../../src/codemods');
const {
  assertNoStaged
} = require('../helpers/assertions');

describe(codemods, function() {
  this.timeout(30e3);

  let tmpPath;

  async function merge({
    fixturesPath,
    blueprint,
    sourceJson,
    list,
    commitMessage,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath
    });

    await beforeMerge();

    let promise = codemods({
      cwd: tmpPath,
      blueprint,
      sourceJson,
      list
    });

    return await processExit({
      promise,
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  it('lists codemods', async function() {
    let {
      result
    } = await merge({
      fixturesPath: 'test/fixtures/codemod/local',
      commitMessage: 'my-app',
      list: true
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
      list: true,
      sourceJson: JSON.stringify({
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
