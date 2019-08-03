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
const init = require('../../src/init');
const run = require('../../src/run');
const {
  assertNoStaged
} = require('../helpers/assertions');

describe(init, function() {
  this.timeout(5 * 60 * 1000);

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

    let promise = init({
      blueprint,
      from,
      to,
      reset,
      compareOnly,
      statsOnly,
      runCodemods,
      listCodemods,
      createCustomDiff
    }).then(afterMerge);

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

  it('can initialize the default blueprint', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      reset: true,
      async afterMerge() {
        expect(path.join(tmpPath, 'ember-cli-update.json')).to.be.a.file()
          .and.equal(path.join(cwd, 'test/fixtures/ember-cli-update-json/default/ember-cli-update.json'));

        await run('git rm --cached ember-cli-update.json', { cwd: tmpPath });

        await fs.remove(path.join(tmpPath, 'ember-cli-update.json'));
      }
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/reset/my-app'
    });

    expect(status).to.match(/^ D app\/controllers\/application\.js$/m);

    assertNoStaged(status);
  });
});
