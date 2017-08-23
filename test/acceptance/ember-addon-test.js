'use strict';

const expect = require('chai').expect;
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const spawn = require('cross-spawn');
const semver = require('semver');
const gitFixtures = require('git-fixtures');
const run = require('../../src/run');

const gitInit = gitFixtures.gitInit;
const _commit = gitFixtures.commit;
const processIo = gitFixtures.processIo;
const _fixtureCompare = gitFixtures.fixtureCompare;

const isNode4Windows = process.platform === 'win32' && semver.satisfies(process.version, '4');

function commit(tmpPath) {
  gitInit({
    cwd: tmpPath
  });

  _commit({
    m: 'add files',
    cwd: tmpPath
  });

  // non-master branch test
  run('git checkout -b foo', {
    cwd: tmpPath
  });
}

function fixtureCompare(
  tmpPath,
  mergeFixtures
) {
  _fixtureCompare({
    expect,
    actual: tmpPath,
    expected: mergeFixtures
  });
}

function merge(app) {
  return processIo({
    ps: app.server,
    cwd: app.path,
    expect
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
      run('git clean -f', {
        cwd: app.path
      });

      if (isNode4Windows) {
        return new Promise(resolve => {
          (function start() {
            let server = spawn('node', [
              'node_modules/ember-cli/bin/ember',
              'update',
              '--to',
              '2.14.1'
            ], {
              cwd: app.path,
              env: process.env
            });

            let id = setTimeout(() => {
              server.stdout.removeAllListeners();
              server.kill('SIGINT');
              server.on('exit', () => {
                run('git reset --hard', {
                  cwd: app.path
                });
                run('git clean -f', {
                  cwd: app.path
                });
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
          '2.14.1'
        ],
        detectServerStart() {
          return true;
        }
      });
    });
  });

  it('works', function() {
    return merge(app).then(result => {
      let status = result.status;

      fixtureCompare(
        app.path,
        'test/fixtures/merge/my-app'
      );

      // changed locally, no change upstream
      expect(status).to.not.contain(' .ember-cli');

      // exists locally, also added upstream with changes
      expect(status).to.contain('modified:   .eslintrc.js');

      // changed locally, removed upstream
      expect(status).to.contain('deleted:    bower.json');

      // changed locally, also changed upstream
      expect(status).to.contain('modified:   README.md');
    });
  });
});
