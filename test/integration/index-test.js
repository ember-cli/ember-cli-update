'use strict';

const path = require('path');
const expect = require('chai').expect;
const tmp = require('tmp');
const sinon = require('sinon');
const gitFixtures = require('git-fixtures');
const isGitClean = require('git-diff-apply').isGitClean;
const emberCliUpdate = require('../../src');
const utils = require('../../src/utils');
const buildTmp = require('../helpers/build-tmp');
const assertions = require('../helpers/assertions');

const processExit = gitFixtures.processExit;
const _fixtureCompare = gitFixtures.fixtureCompare;

const assertNoUnstaged = assertions.assertNoUnstaged;
const assertNoStaged = assertions.assertNoStaged;

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
    let runCodemods = options.runCodemods;
    let from = options.from;
    let to = options.to || '2.16.0-beta.2';
    let reset = options.reset;

    buildTmp({
      fixturesPath,
      tmpPath,
      commitMessage,
      dirty
    });

    process.chdir(tmpPath);

    let promise = emberCliUpdate({
      from,
      to,
      runCodemods,
      reset
    });

    return processExit({
      promise,
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  function fixtureCompare(options) {
    let mergeFixtures = options.mergeFixtures;

    let actual = tmpPath;
    let expected = path.join(cwd, mergeFixtures);

    _fixtureCompare({
      expect,
      actual,
      expected
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

  it('runs codemods', function() {
    let runCodemods = sandbox.spy(utils, 'runCodemods');

    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      runCodemods: true
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

  it('updates glimmer app', function() {
    let runCodemods = sandbox.spy(utils, 'runCodemods');

    return merge({
      fixturesPath: 'test/fixtures/local/glimmer-app',
      from: '0.5.0',
      to: '0.6.1'
    }).then(result => {
      let status = result.status;

      fixtureCompare({
        mergeFixtures: 'test/fixtures/merge/glimmer-app'
      });

      expect(status).to.match(/^M {2}src\/index\.ts$/m);

      assertNoUnstaged(status);

      expect(runCodemods.called).to.not.be.ok;
    });
  });

  it('needs --from if glimmer app before 0.6.3', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/glimmer-app',
      to: '0.6.1'
    }).then(result => {
      let stderr = result.stderr;

      expect(isGitClean({ cwd: tmpPath })).to.be.ok;

      expect(stderr).to.contain('version cannot be determined');
    });
  });

  it('resets app', function() {
    let runCodemods = sandbox.spy(utils, 'runCodemods');

    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      reset: true
    }).then(result => {
      let status = result.status;

      fixtureCompare({
        mergeFixtures: 'test/fixtures/reset/my-app'
      });

      expect(status).to.match(/^ D app\/controllers\/application\.js$/m);

      assertNoStaged(status);

      expect(runCodemods.called).to.not.be.ok;
    });
  });
});
