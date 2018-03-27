'use strict';

const expect = require('chai').expect;
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const gitFixtures = require('git-fixtures');
const run = require('../../src/run');
const assertions = require('../helpers/assertions');

const gitInit = gitFixtures.gitInit;
const _commit = gitFixtures.commit;
const postCommit = gitFixtures.postCommit;
const processIo = gitFixtures.processIo;
const _fixtureCompare = gitFixtures.fixtureCompare;

const assertNormalUpdate = assertions.assertNormalUpdate;
const assertNoUnstaged = assertions.assertNoUnstaged;

const commitMessage = 'add files';

function resetAndClean(cwd) {
  run('git reset --hard', { cwd });
  run('git clean -f', { cwd });
}

function commit(tmpPath) {
  gitInit({
    cwd: tmpPath
  });

  _commit({
    m: commitMessage,
    cwd: tmpPath
  });

  postCommit({
    cwd: tmpPath
  });
}

describe('Acceptance | ember-addon', function() {
  this.timeout(600000);

  let app;

  beforeEach(function() {
    app = new AddonTestApp();

    return app.create('my-app', {
      fixturesPath: 'test/fixtures/local',
      skipNpm: true
    }).then(() => {
      app.editPackageJSON(pkg => {
        pkg.devDependencies['ember-cli-update'] = '*';
      });

      commit(app.path);

      return app.run('npm', 'install');
    }).then(() => {
      // get rid of package-lock.json
      // and reset line ending changes on Windows
      resetAndClean(app.path);

      let args = [
        '--to',
        '3.0.1',
        '--resolve-conflicts'
      ];

      return app.startServer({
        command: 'update',
        additionalArguments: args,
        detectServerStart() {
          return true;
        }
      });
    });
  });

  function fixtureCompare(options) {
    let mergeFixtures = options.mergeFixtures;

    let actual = app.path;
    let expected = mergeFixtures;

    _fixtureCompare({
      expect,
      actual,
      expected
    });
  }

  function merge() {
    return processIo({
      ps: app.server,
      cwd: app.path,
      commitMessage,
      expect
    });
  }

  it('works', function() {
    return merge().then(result => {
      let status = result.status;

      // remove addon because it's not in the fixtures
      app.editPackageJSON(pkg => {
        delete pkg.devDependencies['ember-cli-update'];
      });

      fixtureCompare({
        mergeFixtures: 'test/fixtures/merge/my-app'
      });

      assertNormalUpdate(status);
      assertNoUnstaged(status);
    });
  });
});
