'use strict';

const expect = require('chai').expect;
const tmp = require('tmp');
const fs = require('fs-extra');
const gitFixtures = require('git-fixtures');
const assertNormalUpdate = require('../helpers/assert-normal-update');

const gitInit = gitFixtures.gitInit;
const commit = gitFixtures.commit;
const postCommit = gitFixtures.postCommit;
const processBin = gitFixtures.processBin;
const _fixtureCompare = gitFixtures.fixtureCompare;

const commitMessage = 'add files';

function buildTmp(
  fixturesPath,
  tmpPath,
  dirty
) {
  gitInit({
    cwd: tmpPath
  });

  fs.copySync(fixturesPath, tmpPath);

  commit({
    m: commitMessage,
    cwd: tmpPath
  });

  postCommit({
    cwd: tmpPath,
    dirty
  });
}

describe('Acceptance - ember-cli-build', function() {
  this.timeout(30000);

  let tmpPath;

  beforeEach(function() {
    tmpPath = tmp.dirSync().name;
  });

  function merge(options) {
    let fixturesPath = options.fixturesPath;
    let dirty = options.dirty;

    buildTmp(
      fixturesPath,
      tmpPath,
      dirty
    );

    return processBin({
      binFile: 'ember-cli-update',
      args: [
        '--to',
        '2.16.0-beta.2'
      ],
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  function fixtureCompare(
    mergeFixtures
  ) {
    _fixtureCompare({
      expect,
      actual: tmpPath,
      expected: mergeFixtures
    });
  }

  it('updates app', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app'
    }).then(result => {
      let status = result.status;

      fixtureCompare('test/fixtures/merge/my-app');

      assertNormalUpdate(status);
    });
  });

  it('updates addon', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-addon'
    }).then(result => {
      let status = result.status;

      fixtureCompare('test/fixtures/merge/my-addon');

      assertNormalUpdate(status);
    });
  });

  it('handles dirty', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      dirty: true
    }).then(result => {
      let status = result.status;
      let stderr = result.stderr;

      expect(status).to.equal(`?? a-random-new-file
`);

      expect(stderr).to.contain('You must start with a clean working directory');
      expect(stderr).to.not.contain('UnhandledPromiseRejectionWarning');
    });
  });

  it('handles non-ember-cli app', function() {
    return merge({
      fixturesPath: 'test/fixtures/app'
    }).then(result => {
      let stderr = result.stderr;

      expect(stderr).to.contain('Ember CLI was not found in this project\'s package.json');
    });
  });
});
