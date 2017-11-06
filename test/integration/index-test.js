'use strict';

const path = require('path');
const expect = require('chai').expect;
const tmp = require('tmp');
const fs = require('fs');
const sinon = require('sinon');
const gitFixtures = require('git-fixtures');
const isGitClean = require('git-diff-apply').isGitClean;
const emberCliUpdate = require('../../src');
const utils = require('../../src/utils');
const buildTmp = require('../helpers/build-tmp');
const assertions = require('../helpers/assertions');

const processExit = gitFixtures.processExit;

const assertNoUnstaged = assertions.assertNoUnstaged;

const commitMessage = 'add files';

describe('Integration - index', function() {
  this.timeout(30000);

  let cwd;
  let sandbox;
  let tmpPath;

  before(function() {
    cwd = process.cwd();
  });

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    tmpPath = tmp.dirSync().name;
  });

  afterEach(function() {
    sandbox.restore();

    process.chdir(cwd);
  });

  function merge(options) {
    let fixturesPath = options.fixturesPath;
    let dirty = options.dirty;
    let ignoreConflicts = options.ignoreConflicts;

    buildTmp({
      fixturesPath,
      tmpPath,
      commitMessage,
      dirty
    });

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

  it('doesn\'t run codemods or stage files if conflicts and ignoreConflicts true', function() {
    let runCodemods = sandbox.spy(utils, 'runCodemods');

    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      ignoreConflicts: true
    }).then(result => {
      let status = result.status;

      let actual = fs.readFileSync(path.join(tmpPath, '.eslintrc.js'), 'utf8');

      expect(actual).to.contain('<<<<<<< HEAD');

      expect(status).to.match(/^AA \.eslintrc\.js$/m);
      expect(status).to.match(/^UD bower\.json$/m);

      assertNoUnstaged(status);

      expect(runCodemods.calledOnce).to.not.be.ok;
    });
  });

  it('runs codemods and stages files if no conflicts but ignoreConflicts true', function() {
    let runCodemods = sandbox.spy(utils, 'runCodemods');

    return merge({
      fixturesPath: 'test/fixtures/noconflict',
      ignoreConflicts: true
    }).then(result => {
      let status = result.status;

      assertNoUnstaged(status);

      expect(runCodemods.calledOnce).to.be.ok;
    });
  });

  it('handles non-ember-cli app', function() {
    return merge({
      fixturesPath: 'test/fixtures/type/none'
    }).then(result => {
      let stderr = result.stderr;

      expect(isGitClean({ cwd: tmpPath })).to.be.ok;

      expect(stderr).to.contain('Ember CLI project type could not be determined');
    });
  });

  it('handles non-npm dir', function() {
    return merge({
      fixturesPath: 'test/fixtures/no-package-json'
    }).then(result => {
      let stderr = result.stderr;

      expect(isGitClean({ cwd: tmpPath })).to.be.ok;

      expect(stderr).to.contain('No package.json was found in this directory');
    });
  });

  it('handles malformed package.json', function() {
    return merge({
      fixturesPath: 'test/fixtures/malformed-package-json'
    }).then(result => {
      let stderr = result.stderr;

      expect(isGitClean({ cwd: tmpPath })).to.be.ok;

      expect(stderr).to.contain('The package.json is malformed');
    });
  });
});
