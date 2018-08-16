'use strict';

const path = require('path');
const { expect } = require('chai');
const tmp = require('tmp');
const sinon = require('sinon');
const {
  processExit,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const isGitClean = require('git-diff-apply').isGitClean;
const emberCliUpdate = require('../../src');
const utils = require('../../src/utils');
const buildTmp = require('../helpers/build-tmp');
const {
  assertNoUnstaged,
  assertNoStaged
} = require('../helpers/assertions');

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

  function merge({
    fixturesPath,
    dirty,
    from,
    to = '3.2.0-beta.1',
    reset,
    compareOnly,
    dryRun,
    runCodemods,
    listCodemods
  }) {
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
      reset,
      compareOnly,
      dryRun,
      runCodemods,
      listCodemods
    });

    return processExit({
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

  it('handles dirty', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      dirty: true
    }).then(({
      status,
      stderr
    }) => {
      expect(status).to.equal(`?? a-random-new-file
`);

      expect(stderr).to.contain('You must start with a clean working directory');
      expect(stderr).to.not.contain('UnhandledPromiseRejectionWarning');
    });
  });

  it('handles non-ember-cli app', function() {
    return merge({
      fixturesPath: 'test/fixtures/type/none'
    }).then(({
      stderr
    }) => {
      expect(isGitClean({ cwd: tmpPath })).to.be.ok;

      expect(stderr).to.contain('Ember CLI project type could not be determined');
    });
  });

  it('handles non-npm dir', function() {
    return merge({
      fixturesPath: 'test/fixtures/no-package-json'
    }).then(({
      stderr
    }) => {
      expect(isGitClean({ cwd: tmpPath })).to.be.ok;

      expect(stderr).to.contain('No package.json was found in this directory');
    });
  });

  it('handles malformed package.json', function() {
    return merge({
      fixturesPath: 'test/fixtures/malformed-package-json'
    }).then(({
      stderr
    }) => {
      expect(isGitClean({ cwd: tmpPath })).to.be.ok;

      expect(stderr).to.contain('The package.json is malformed');
    });
  });

  it('updates glimmer app', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/glimmer-app',
      from: '0.5.0',
      to: '0.6.1'
    }).then(({
      status
    }) => {
      fixtureCompare({
        mergeFixtures: 'test/fixtures/merge/glimmer-app'
      });

      expect(status).to.match(/^M {2}src\/index\.ts$/m);

      assertNoUnstaged(status);
    });
  });

  it('needs --from if glimmer app before 0.6.3', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/glimmer-app',
      to: '0.6.1'
    }).then(({
      stderr
    }) => {
      expect(isGitClean({ cwd: tmpPath })).to.be.ok;

      expect(stderr).to.contain('version cannot be determined');
    });
  });

  it('resets app', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      reset: true
    }).then(({
      status
    }) => {
      fixtureCompare({
        mergeFixtures: 'test/fixtures/reset/my-app'
      });

      expect(status).to.match(/^ D app\/controllers\/application\.js$/m);

      assertNoStaged(status);
    });
  });

  it('opens compare url', function() {
    let opn = sandbox.stub(utils, 'opn');

    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      compareOnly: true
    }).then(({
      result,
      status
    }) => {
      assertNoUnstaged(status);

      expect(result, 'don\'t accidentally print anything to the console').to.be.undefined;

      expect(opn.calledOnce).to.be.ok;
      expect(opn.args[0][0]).to.equal('https://github.com/ember-cli/ember-new-output/compare/v2.11.1...v3.2.0-beta.1');
    });
  });

  it('resolves semver ranges', function() {
    let opn = sandbox.stub(utils, 'opn');

    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      from: '2.11',
      to: '^2',
      compareOnly: true
    }).then(() => {
      expect(opn.args[0][0]).to.equal('https://github.com/ember-cli/ember-new-output/compare/v2.11.1...v2.18.2');
    });
  });

  it('performs a dry run', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      dryRun: true
    }).then(({
      result,
      status
    }) => {
      assertNoStaged(status);

      expect(result).to.equal('Would update from 2.11.1 to 3.2.0-beta.1.');
    });
  });

  it('performs a codemod dry run', function() {
    return merge({
      fixturesPath: 'test/fixtures/merge/my-app',
      runCodemods: true,
      dryRun: true
    }).then(({
      result,
      status
    }) => {
      assertNoStaged(status);

      expect(result).to.equal('Would run the following codemods: ember-modules-codemod, ember-qunit-codemod, ember-test-helpers-codemod, es5-getter-ember-codemod, qunit-dom-codemod.');
    });
  });

  it('lists codemods', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      listCodemods: true
    }).then(({
      result,
      status
    }) => {
      assertNoStaged(status);

      expect(JSON.parse(result)).to.have.own.property('ember-modules-codemod');
    });
  });
});
