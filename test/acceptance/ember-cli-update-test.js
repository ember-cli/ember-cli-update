'use strict';

const fs = require('fs-extra');
const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processBin,
  fixtureCompare: _fixtureCompare
} = require('git-fixtures');
const {
  assertNormalUpdate,
  assertNoUnstaged,
  assertNoStaged,
  assertCodemodRan
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const run = require('../../src/run');

describe(function() {
  this.timeout(30 * 1000);

  let tmpPath;

  async function merge({
    fixturesPath,
    from,
    to = '3.2.0-beta.1',
    runCodemods,
    subDir = '',
    commitMessage,
    init,
    reset,
    blueprint,
    install,
    addon,
    bootstrap,
    save,
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath,
      subDir
    });

    await beforeMerge();

    let args = [
      `--to=${to}`,
      '--resolve-conflicts'
    ];
    if (runCodemods) {
      args = [
        '--run-codemods'
      ];
    }
    if (init) {
      args = [
        'init',
        `--to=${to}`
      ];
      if (reset) {
        args.push('--reset');
      }
    }
    if (install) {
      args = [
        'install',
        addon
      ];
    }
    if (bootstrap) {
      args = [
        'bootstrap'
      ];
    }
    if (save) {
      args = [
        'save',
        `-b=${blueprint}`,
        `--from=${from}`
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

  it('updates app', async function() {
    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  });

  it('updates addon', async function() {
    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/addon/local',
      commitMessage: 'my-addon'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/addon/merge/my-addon'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  });

  it('runs codemods', async function() {
    this.timeout(10 * 60 * 1000);

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/codemod/local',
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
    } = await promise;

    // file is indeterminent between OS's, so ignore
    await fs.remove(path.join(tmpPath, 'MODULE_REPORT.md'));

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

  it('scopes to sub dir if run from there', async function() {
    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      subDir: 'foo/bar'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });

    assertNormalUpdate(status);
    assertNoUnstaged(status);
  });

  it('can pick from multiple blueprints', async function() {
    this.timeout(10 * 60 * 1000);

    let {
      location,
      version: to
    } = require('../fixtures/blueprint/app/local-app/merge/my-app/ember-cli-update').blueprints[1];

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/local',
      commitMessage: 'my-app',
      to,
      async beforeMerge() {
        await initBlueprint('test/fixtures/blueprint/app/local', location);
      }
    });

    ps.stdout.on('data', data => {
      let str = data.toString();
      if (str.includes('Blueprint updates have been found.')) {
        ps.stdin.write('\u001b[B\n');
      }
    });

    let {
      status
    } = await promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/app/local-app/merge/my-app'
    });

    expect(status).to.match(/^M {2}.*ember-cli-update\.json$/m);

    assertNoUnstaged(status);
  });

  it('can init the default blueprint', async function() {
    this.timeout(5 * 60 * 1000);

    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      init: true,
      reset: true
    })).promise;

    expect(path.join(tmpPath, 'ember-cli-update.json')).to.be.a.file()
      .and.equal('test/fixtures/ember-cli-update-json/default/ember-cli-update.json');

    await fs.remove(path.join(tmpPath, 'ember-cli-update.json'));

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/reset/my-app'
    });

    expect(status).to.match(/^ D app\/controllers\/application\.js$/m);

    assertNoStaged(status);
  });

  it('can install an addon with a default blueprint and no state file', async function() {
    this.timeout(3 * 60 * 1000);

    let {
      location
    } = require('../fixtures/blueprint/addon/legacy-app/merge/ideal/my-app/ember-cli-update').blueprints[0];

    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/blueprint/addon/legacy-app/local/no-addon',
      commitMessage: 'my-app',
      install: true,
      addon: location,
      async beforeMerge() {
        await initBlueprint('test/fixtures/blueprint/addon/legacy', location);

        await run('npm install', { cwd: tmpPath });
      }
    })).promise;

    await fs.remove(path.join(tmpPath, 'package-lock.json'));

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/addon/legacy-app/merge/no-state-file/my-app'
    });

    assertNoStaged(status);
  });

  it('can bootstrap the default blueprint', async function() {
    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/app/merge',
      commitMessage: 'my-app',
      bootstrap: true
    })).promise;

    assertNoUnstaged(status);

    expect(path.join(tmpPath, 'ember-cli-update.json')).to.be.a.file()
      .and.equal('test/fixtures/ember-cli-update-json/default/ember-cli-update.json');

    await fs.remove(path.join(tmpPath, 'ember-cli-update.json'));

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });
  });

  it('can save an old blueprint\'s state', async function() {
    let {
      name,
      version: from
    } = require('../fixtures/blueprint/app/npm-app/local/my-app/ember-cli-update').blueprints[0];

    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/blueprint/app/npm-app/local',
      commitMessage: 'my-app',
      save: true,
      blueprint: name,
      from,
      async beforeMerge() {
        await fs.remove(path.join(tmpPath, 'ember-cli-update.json'));
      }
    })).promise;

    assertNoUnstaged(status);

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/app/npm-app/local/my-app'
    });
  });
});
