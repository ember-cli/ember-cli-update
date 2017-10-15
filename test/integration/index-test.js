'use strict';

const path = require('path');
const expect = require('chai').expect;
const tmp = require('tmp');
const fs = require('fs');
const gitFixtures = require('git-fixtures');
const isGitClean = require('git-diff-apply').isGitClean;
const emberCliUpdate = require('../../src');
const buildTmp = require('../helpers/build-tmp');

const processExit = gitFixtures.processExit;

const commitMessage = 'add files';

describe('Integration - index', function() {
  this.timeout(30000);

  let cwd;
  let tmpPath;

  before(function() {
    cwd = process.cwd();
  });

  beforeEach(function() {
    tmpPath = tmp.dirSync().name;
  });

  afterEach(function() {
    process.chdir(cwd);
  });

  function merge(options) {
    let fixturesPath = options.fixturesPath;
    let dirty = options.dirty;
    let ignoreConflicts = options.ignoreConflicts;

    buildTmp(
      fixturesPath,
      tmpPath,
      commitMessage,
      dirty
    );

    process.chdir(tmpPath);

    let promise = emberCliUpdate({
      to: '2.16.0-beta.2',
      ignoreConflicts
    });

    return processExit({
      promise,
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

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

  it('handles ignoreConflicts', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      ignoreConflicts: true
    }).then(result => {
      let status = result.status;

      let actual = fs.readFileSync(path.join(tmpPath, '.eslintrc.js'), 'utf8');

      expect(actual).to.contain('<<<<<<< HEAD');

      expect(status).to.match(/^AA \.eslintrc\.js$/m);
      expect(status).to.match(/^UD bower\.json$/m);
    });
  });

  it('handles non-ember-cli app', function() {
    return merge({
      fixturesPath: 'test/fixtures/app'
    }).then(result => {
      let stderr = result.stderr;

      expect(isGitClean({ cwd: tmpPath })).to.be.ok;

      expect(stderr).to.contain('Ember CLI was not found in this project\'s package.json');
    });
  });
});
