'use strict';

const fs = require('fs-extra');
const path = require('path');
const expect = require('chai').expect;
const tmp = require('tmp');
const gitFixtures = require('git-fixtures');
const buildTmp = require('../helpers/build-tmp');
const assertions = require('../helpers/assertions');

const processBin = gitFixtures.processBin;
const _fixtureCompare = gitFixtures.fixtureCompare;

const assertNormalUpdate = assertions.assertNormalUpdate;
const assertNoUnstaged = assertions.assertNoUnstaged;
const assertCodemodRan = assertions.assertCodemodRan;

const commitMessage = 'add files';

describe('Acceptance - ember-cli-update', function() {
  this.timeout(30000);

  let tmpPath;

  beforeEach(function() {
    tmpPath = tmp.dirSync().name;
  });

  function merge(options) {
    let fixturesPath = options.fixturesPath;
    let runCodemods = options.runCodemods;
    let subDir = options.subDir || '';

    buildTmp({
      fixturesPath,
      tmpPath,
      commitMessage,
      subDir
    });

    tmpPath = path.join(tmpPath, subDir);

    let args = [
      '--to',
      '3.0.1',
      '--resolve-conflicts'
    ];
    if (runCodemods) {
      args = [
        '--run-codemods'
      ];
    }

    return processBin({
      binFile: 'ember-cli-update',
      args,
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  function fixtureCompare(options) {
    let mergeFixtures = options.mergeFixtures;

    let actual = tmpPath;
    let expected = mergeFixtures;

    // file is indeterminent between OS's, so ignore
    fs.removeSync(path.join(actual, 'MODULE_REPORT.md'));

    _fixtureCompare({
      expect,
      actual,
      expected
    });
  }

  it('updates app', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app'
    }).then(result => {
      let status = result.status;

      fixtureCompare({
        mergeFixtures: 'test/fixtures/merge/my-app'
      });

      assertNormalUpdate(status);
      assertNoUnstaged(status);
    });
  });

  it('updates addon', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-addon'
    }).then(result => {
      let status = result.status;

      fixtureCompare({
        mergeFixtures: 'test/fixtures/merge/my-addon'
      });

      assertNormalUpdate(status);
      assertNoUnstaged(status);
    });
  });

  it('runs codemods', function() {
    this.timeout(1200000);

    return merge({
      fixturesPath: 'test/fixtures/merge/my-app',
      runCodemods: true
    }).then(result => {
      let status = result.status;

      let mergeFixtures = 'test/fixtures/codemod/latest-node/my-app';
      if (process.env.NODE_LTS) {
        mergeFixtures = 'test/fixtures/codemod/min-node/my-app';
      }

      fixtureCompare({
        mergeFixtures
      });

      assertNoUnstaged(status);
      assertCodemodRan(status);
    });
  });

  it('scopes to sub dir if run from there', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app',
      subDir: 'foo/bar'
    }).then(result => {
      let status = result.status;

      fixtureCompare({
        mergeFixtures: 'test/fixtures/merge/my-app'
      });

      assertNormalUpdate(status);
      assertNoUnstaged(status);
    });
  });
});
