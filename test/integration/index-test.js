'use strict';

const expect = require('chai').expect;
const tmp = require('tmp');
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

    buildTmp(
      fixturesPath,
      tmpPath,
      commitMessage,
      dirty
    );

    process.chdir(tmpPath);

    let promise = emberCliUpdate({
      to: '2.16.0-beta.2'
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
