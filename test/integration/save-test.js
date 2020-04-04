'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processExit
} = require('git-fixtures');
const { isGitClean } = require('git-diff-apply');
const save = require('../../src/save');

describe(save, function() {
  let tmpPath;

  async function merge({
    fixturesPath,
    commitMessage
  }) {
    tmpPath = await buildTmp({
      fixturesPath
    });

    let promise = save({
      cwd: tmpPath
    });

    return await processExit({
      promise,
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  it('handles missing version', async function() {
    let {
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(stderr).to.equal('A custom blueprint cannot detect --from. You must supply it.');
  });
});
