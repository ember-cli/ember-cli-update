'use strict';

const fs = require('fs-extra');
const path = require('path');
const { expect } = require('chai');
const tmp = require('tmp');
const {
  processBin,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const buildTmp = require('../helpers/build-tmp');
const {
  assertNormalUpdate,
  assertNoUnstaged,
  assertCodemodRan
} = require('../helpers/assertions');

const commitMessage = 'add files';

describe('Acceptance - ember-cli-update', function() {
  this.timeout(30000);

  let tmpPath;

  beforeEach(function() {
    tmpPath = tmp.dirSync().name;
  });

  function merge({
    fixturesPath,
    runCodemods,
    subDir = ''
  }) {
    buildTmp({
      fixturesPath,
      tmpPath,
      commitMessage,
      subDir
    });

    tmpPath = path.join(tmpPath, subDir);

    let args = [
      '--to',
      '3.2.0-beta.1',
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
    }).promise;
  }

  function fixtureCompare({
    mergeFixtures
  }) {
    let actual = tmpPath;
    let expected = mergeFixtures;

    _fixtureCompare({
      expect,
      actual,
      expected
    });
  }

  it('updates app', function() {
    return merge({
      fixturesPath: 'test/fixtures/local/my-app'
    }).then(({
      status
    }) => {
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
    }).then(({
      status
    }) => {
      fixtureCompare({
        mergeFixtures: 'test/fixtures/merge/my-addon'
      });

      assertNormalUpdate(status);
      assertNoUnstaged(status);
    });
  });

  it('runs codemods', function() {
    this.timeout(5 * 60 * 1000);

    return merge({
      fixturesPath: 'test/fixtures/merge/my-app',
      runCodemods: true
    }).then(({
      status
    }) => {
      // file is indeterminent between OS's, so ignore
      fs.removeSync(path.join(tmpPath, 'MODULE_REPORT.md'));

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
    }).then(({
      status
    }) => {
      fixtureCompare({
        mergeFixtures: 'test/fixtures/merge/my-app'
      });

      assertNormalUpdate(status);
      assertNoUnstaged(status);
    });
  });
});
