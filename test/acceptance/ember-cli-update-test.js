'use strict';

const fs = require('fs-extra');
const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('chai');
const co = require('co');
const {
  buildTmp,
  processBin,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const {
  assertNormalUpdate,
  assertNoUnstaged,
  assertCodemodRan
} = require('../helpers/assertions');
const semver = require('semver');

const shouldSkipCodemods = process.platform === 'linux' && semver.satisfies(semver.valid(process.version), '6');

describe(function() {
  this.timeout(30 * 1000);

  let tmpPath;

  let merge = co.wrap(function* merge({
    fixturesPath,
    runCodemods,
    subDir = '',
    commitMessage
  }) {
    tmpPath = yield buildTmp({
      fixturesPath,
      subDir
    });

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
    });
  });

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

  it('updates app', co.wrap(function*() {
    let {
      status
    } = yield (yield merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  }));

  it('updates addon', co.wrap(function*() {
    let {
      status
    } = yield (yield merge({
      fixturesPath: 'test/fixtures/addon/local',
      commitMessage: 'my-addon'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/addon/merge/my-addon'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  }));

  (shouldSkipCodemods ? it.skip : it)('runs codemods', co.wrap(function*() {
    this.timeout(5 * 60 * 1000);

    let {
      ps,
      promise
    } = yield merge({
      fixturesPath: 'test/fixtures/app/merge',
      commitMessage: 'my-app',
      runCodemods: true
    });

    ps.stdout.on('data', data => {
      let str = data.toString();
      if (str.includes('These codemods apply to your project.')) {
        ps.stdin.write('a\n');
      }
    });

    let {
      status
    } = yield promise;

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
  }));

  it('scopes to sub dir if run from there', co.wrap(function*() {
    let {
      status
    } = yield (yield merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      subDir: 'foo/bar'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  }));
});
