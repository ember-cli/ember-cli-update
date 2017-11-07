'use strict';

const expect = require('chai').expect;
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const spawn = require('cross-spawn');
const semver = require('semver');
const gitFixtures = require('git-fixtures');
const debug = require('debug')('ember-cli-update');
const run = require('../../src/run');
const assertions = require('../helpers/assertions');

const gitInit = gitFixtures.gitInit;
const _commit = gitFixtures.commit;
const postCommit = gitFixtures.postCommit;
const processIo = gitFixtures.processIo;
const _fixtureCompare = gitFixtures.fixtureCompare;

const assertNormalUpdate = assertions.assertNormalUpdate;
const assertNoUnstaged = assertions.assertNoUnstaged;
const assertCodemodRan = assertions.assertCodemodRan;

const isNode4Windows = process.platform === 'win32' && semver.satisfies(process.version, '4');

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

      if (isNode4Windows) {
        return new Promise(resolve => {
          (function start() {
            let server = spawn('node', [
              'node_modules/ember-cli/bin/ember',
              'update',
              '--to',
              '2.16.0-beta.2'
            ], {
              cwd: app.path,
              env: process.env
            });

            let id = setTimeout(() => {
              debug('timed out waiting for output');
              server.stdout.removeAllListeners();
              server.kill('SIGINT');
              server.on('exit', () => {
                resetAndClean(app.path);
                start();
              });
            }, 10000);

            server.stdout.once('data', () => {
              clearTimeout(id);
              app.server = server;
              resolve();
            });
          })();
        });
      }

      return app.startServer({
        command: 'update',
        additionalArguments: [
          '--to',
          '2.16.0-beta.2'
        ],
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
      assertCodemodRan(status);
    });
  });
});
