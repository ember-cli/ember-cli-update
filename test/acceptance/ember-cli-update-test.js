'use strict';

const expect = require('chai').expect;
const tmp = require('tmp');
const gitFixtures = require('git-fixtures');
const buildTmp = require('../helpers/build-tmp');
const assertNormalUpdate = require('../helpers/assert-normal-update');

const processBin = gitFixtures.processBin;
const _fixtureCompare = gitFixtures.fixtureCompare;

const commitMessage = 'add files';

describe('Acceptance - ember-cli-build', function() {
  this.timeout(30000);

  let tmpPath;

  beforeEach(function() {
    tmpPath = tmp.dirSync().name;
  });

  function merge(options) {
    let fixturesPath = options.fixturesPath;

    buildTmp(
      fixturesPath,
      tmpPath,
      commitMessage
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
});
