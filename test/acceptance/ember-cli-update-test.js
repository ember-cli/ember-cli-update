'use strict';

const path = require('path');
const expect = require('chai').expect;
const fs = require('fs-extra');
const gitFixtures = require('git-fixtures');
const run = require('../../src/run');

const gitInit = gitFixtures.gitInit;
const commit = gitFixtures.commit;
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

  // non-master branch test
  run('git checkout -b foo', {
    cwd: tmpPath
  });

  if (dirty) {
    fs.writeFileSync(path.join(tmpPath, 'a-random-new-file'), 'foo');
  }
}

function fixtureCompare(
  tmpPath,
  mergeFixtures
) {
  _fixtureCompare({
    expect,
    actual: tmpPath,
    expected: mergeFixtures
  });
}

describe('Acceptance - ember-cli-build', function() {
  this.timeout(30000);

  function merge(options) {
    let fixturesPath = options.fixturesPath;
    let tmpPath = options.tmpPath;
    let dirty = options.dirty;

    fs.emptyDirSync(tmpPath);

    buildTmp(
      fixturesPath,
      tmpPath,
      dirty
    );

    return processBin({
      binFile: 'ember-cli-update',
      args: [
        '--to',
        '2.14.1'
      ],
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  it('updates app', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      tmpPath: 'tmp/my-app'
    }).then(result => {
      let status = result.status;

      fixtureCompare(
        'tmp/my-app',
        'test/fixtures/merge/my-app'
      );

      // changed locally, no change upstream
      expect(status).to.not.contain(' .ember-cli');

      // exists locally, also added upstream with changes
      expect(status).to.contain('modified:   .eslintrc.js');

      // changed locally, removed upstream
      expect(status).to.contain('deleted:    bower.json');

      // changed locally, also changed upstream
      expect(status).to.contain('modified:   README.md');
    });
  });

  it('updates addon', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-addon',
      tmpPath: 'tmp/my-addon'
    }).then(result => {
      let status = result.status;

      fixtureCompare(
        'tmp/my-addon',
        'test/fixtures/merge/my-addon'
      );

      // changed locally, no change upstream
      expect(status).to.not.contain(' .ember-cli');

      // exists locally, also added upstream with changes
      expect(status).to.contain('modified:   .eslintrc.js');

      // changed locally, removed upstream
      expect(status).to.contain('deleted:    bower.json');

      // changed locally, also changed upstream
      expect(status).to.contain('modified:   README.md');
    });
  });

  it('handles dirty', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      tmpPath: 'tmp/my-app',
      dirty: true
    }).then(result => {
      let stderr = result.stderr;

      expect(stderr).to.contain('You must start with a clean working directory');
      expect(stderr).to.not.contain('UnhandledPromiseRejectionWarning');
    });
  });
});
