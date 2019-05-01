'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const { AddonTestApp } = require('ember-cli-addon-tests');
const {
  gitInit,
  commit: _commit,
  postCommit,
  processIo,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const run = require('../../src/run');
const {
  assertNormalUpdate,
  assertNoUnstaged
} = require('../helpers/assertions');
const { promisify } = require('util');
const cpr = promisify(require('cpr'));

const commitMessage = 'add files';

async function reset(tmpPath) {
  await run('git rm -r .', { cwd: tmpPath });

  await cpr('test/fixtures/app/local/my-app', tmpPath);
}

function init(tmpPath) {
  gitInit({
    cwd: tmpPath
  });

  _commit({
    cwd: tmpPath
  });
}

function commit(tmpPath) {
  _commit({
    m: commitMessage,
    cwd: tmpPath
  });

  postCommit({
    cwd: tmpPath
  });
}

describe(function() {
  this.timeout(10 * 60 * 1000);

  let app;

  beforeEach(async function() {
    app = new AddonTestApp();

    await app.create('my-app', {
      fixturesPath: 'test/fixtures/app/local',
      skipNpm: true
    });

    init(app.path);

    // remove newer fixture files not present in older versions
    await reset(app.path);

    app.editPackageJSON(pkg => {
      pkg.devDependencies['ember-cli-update'] = '*';
    });

    commit(app.path);

    await app.run('npm', 'install', '--no-package-lock');

    await app.startServer({
      command: 'update',
      additionalArguments: [
        '--to',
        '3.2.0-beta.1',
        '--resolve-conflicts'
      ],
      detectServerStart() {
        return true;
      }
    });
  });

  function fixtureCompare({
    mergeFixtures
  }) {
    let actual = app.path;
    let expected = mergeFixtures;

    _fixtureCompare({
      expect,
      actual,
      expected
    });
  }

  async function merge() {
    return await processIo({
      ps: app.server,
      cwd: app.path,
      commitMessage,
      expect
    });
  }

  it('works', async function() {
    let {
      status
    } = await merge();

    // remove addon because it's not in the fixtures
    app.editPackageJSON(pkg => {
      delete pkg.devDependencies['ember-cli-update'];
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  });
});
