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
const { isGitClean } = require('git-diff-apply');
const {
  assertNoUnstaged,
  assertNoStaged,
  assertCodemodRan
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const { spawn } = require('../../src/run');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const overwriteBlueprintFiles = require('../../src/overwrite-blueprint-files');
const { defaultTo } = require('../../src/constants');

const select = ' ';
const down = '\u001b[B';
const enter = '\n';

describe(function() {
  this.timeout(60e3);

  let tmpPath;

  async function merge({
    fixturesPath,
    from,
    to = '3.11.0-beta.1',
    listCodemods,
    runCodemods,
    commitMessage,
    init,
    reset,
    blueprint,
    install,
    addon,
    bootstrap,
    stats,
    save,
    blueprintOptions = [],
    beforeMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath
    });

    await beforeMerge();

    let args = [
      ...to ? [`--to=${to}`] : [],
      '--resolve-conflicts'
    ];
    if (listCodemods || runCodemods) {
      args = [
        'codemods',
        ...listCodemods ? ['--list'] : []
      ];
    }
    if (init) {
      args = [
        'init',
        ...to ? [`--to=${to}`] : []
      ];
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
    if (stats) {
      args = [
        'stats'
      ];
    }
    if (save) {
      args = [
        'save'
      ];
    }
    if (reset) {
      args = [
        'reset',
        ...to ? [`--to=${to}`] : []
      ];
    }
    if (blueprint) {
      // Keep this to `-b` to test the short alias
      args.push(`-b=${blueprint}`);
    }
    if (from) {
      args.push(`--from=${from}`);
    }
    args = [...args, ...blueprintOptions];

    return processBin({
      binFile: 'ember-cli-update',
      args,
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  function fixtureCompare({
    actual = tmpPath,
    mergeFixtures
  }) {
    let expected = mergeFixtures;

    _fixtureCompare({
      expect,
      actual,
      expected
    });
  }

  it('works', async function() {
    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/merge/my-app'
    });

    assertNoUnstaged(status);
  });

  it('runs codemods', async function() {
    this.timeout(1.5 * 60e3);

    async function _merge(src, dest) {
      await fs.copy(
        path.resolve(__dirname, `../fixtures/codemod/codemods/ember-modules-codemod/${src}/my-app`),
        dest,
        {
          overwrite: true,
          recursive: true
        }
      );
    }

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/codemod/local',
      commitMessage: 'my-app',
      runCodemods: true,
      async beforeMerge() {
        await _merge('local', tmpPath);
      }
    });

    ps.stdout.pipe(process.stdout);

    await new Promise(resolve => {
      function stdoutData(data) {
        let str = data.toString();
        if (str.includes('These codemods apply to your project.')) {
          ps.stdin.write(`${select}${enter}`);
          ps.stdout.removeListener('data', stdoutData);
          resolve();
        }
      }
      ps.stdout.on('data', stdoutData);
    });

    let {
      status
    } = await promise;

    assertNoUnstaged(status);
    assertCodemodRan(status);

    // file is indeterminent between OS's, so ignore
    await fs.remove(path.join(tmpPath, 'MODULE_REPORT.md'));

    let nodeVersion = 'latest-node';
    if (process.env.NODE_LTS === 'true') {
      nodeVersion = 'min-node';
    }

    let mergeFixtures = await buildTmp({
      fixturesPath: 'test/fixtures/codemod/local',
      noGit: true
    });

    await _merge(nodeVersion, mergeFixtures);

    fixtureCompare({
      mergeFixtures
    });
  });

  it('has all up-to-date blueprints', async function() {
    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/remote-app/merge',
      commitMessage: 'my.app'
    });

    ps.stdout.pipe(process.stdout);

    await new Promise(resolve => {
      function stdoutData(data) {
        let str = data.toString();
        if (str.includes('All blueprints are up-to-date!')) {
          ps.stdout.removeListener('data', stdoutData);
          resolve();
        }
      }
      ps.stdout.on('data', stdoutData);
    });

    let {
      status
    } = await promise;

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(status).to.equal('');
  });

  it('can pick from multiple blueprints', async function() {
    this.timeout(1.5 * 60e3);

    let {
      location,
      version: to
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/merge/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/local',
      commitMessage: 'my-app',
      to: null,
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: 'test/fixtures/blueprint/app/local',
          resolvedFrom: tmpPath,
          relativeDir: location
        });
      }
    });

    let whichBlueprint = new Promise(resolve => {
      function whichBlueprint(data) {
        let str = data.toString();
        if (str.includes('Blueprint updates have been found.')) {
          ps.stdin.write(`${enter}`);
          ps.stdout.removeListener('data', whichBlueprint);
          resolve();
        }
      }
      ps.stdout.on('data', whichBlueprint);
    });
    let whichVersion = new Promise(resolve => {
      function whichVersion(data) {
        let str = data.toString();
        if (str.includes('Do you want the latest version?')) {
          ps.stdin.write(`${down}${enter}`);
          ps.stdout.removeListener('data', whichVersion);
          resolve();
        }
      }
      ps.stdout.on('data', whichVersion);
    });
    let customVersion = new Promise(resolve => {
      function customVersion(data) {
        let str = data.toString();
        if (str.includes('What version?')) {
          let range = to;
          ps.stdin.write(`${range}${enter}`);
          ps.stdout.removeListener('data', customVersion);
          resolve();
        }
      }
      ps.stdout.on('data', customVersion);
    });
    await whichBlueprint;
    await whichVersion;
    await customVersion;

    let {
      status
    } = await promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/app/local-app/merge/my-app'
    });

    expect(status).to.match(/^M {2}.*ember-cli-update\.json$/m);

    assertNoUnstaged(status);
  });

  it('can reset from multiple blueprint', async function() {
    let {
      location
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/reset/local/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      version: to
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/reset/merge/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/reset/local',
      commitMessage: 'my-app',
      reset: true,
      to,
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: 'test/fixtures/blueprint/app/local',
          resolvedFrom: tmpPath,
          relativeDir: location
        });
      }
    });

    let whichBlueprint = new Promise(resolve => {
      function whichBlueprint(data) {
        let str = data.toString();
        if (str.includes('Which blueprint would you like to reset?')) {
          ps.stdin.write(`${down}${enter}`);
          ps.stdout.removeListener('data', whichBlueprint);
          resolve();
        }
      }
      ps.stdout.on('data', whichBlueprint);
    });
    await whichBlueprint;

    let {
      status
    } = await promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/app/local-app/reset/merge/my-app'
    });

    assertNoStaged(status);
  });

  it('can init the default blueprint', async function() {
    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      init: true,
      to: '2.11.1'
    })).promise;

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/init/my-app'
    });

    expect(status).to.match(/^ M README\.md$/m);

    assertNoStaged(status);
  });

  it('can install an addon with a default blueprint and a state file', async function() {
    this.timeout(3 * 60e3);

    let {
      location
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/addon/legacy-app/merge/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/addon/legacy-app/local/ideal',
      commitMessage: 'my-app',
      install: true,
      addon: location,
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: 'test/fixtures/blueprint/addon/legacy',
          resolvedFrom: tmpPath,
          relativeDir: location
        });

        await spawn('npm', ['install'], { cwd: tmpPath });
      }
    });

    overwriteBlueprintFiles(ps);

    let {
      status
    } = await promise;

    await fs.remove(path.join(tmpPath, 'package-lock.json'));

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/addon/legacy-app/merge/my-app'
    });

    assertNoStaged(status);
  });

  it('can update a legacy addon blueprint', async function() {
    this.timeout(5 * 60e3);

    let {
      name,
      location
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/addon/legacy-app/local/ideal/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/addon/legacy-app/local/ideal',
      commitMessage: 'my-app',
      blueprint: name,
      // test semver latest resolution instead of pinned
      to: defaultTo,
      async beforeMerge() {
        await initBlueprint({
          fixturesPath: 'test/fixtures/blueprint/addon/legacy',
          resolvedFrom: tmpPath,
          relativeDir: location
        });
      }
    });

    overwriteBlueprintFiles(ps);

    let {
      status
    } = await promise;

    assertNoUnstaged(status);

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/addon/legacy-app/merge/my-app'
    });
  });

  // this is different than the local test in that it tests
  // that peer-deps (requiring ember-cli internals) works
  // in existing npm addons
  // https://github.com/salsify/ember-cli-dependency-lint/blob/v1.0.3/lib/commands/dependency-lint.js#L5
  it('can update a npm addon blueprint with implicit peer dep', async function() {
    this.timeout(5 * 60e3);

    let {
      name,
      version
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/addon/npm-app/merge/my-app/config/ember-cli-update.json')).blueprints[1];

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/addon/npm-app/local',
      commitMessage: 'my-app',
      blueprint: name,
      to: version
    });

    overwriteBlueprintFiles(ps);

    let {
      status
    } = await promise;

    assertNoUnstaged(status);

    fixtureCompare({
      mergeFixtures: 'test/fixtures/blueprint/addon/npm-app/merge/my-app'
    });
  });

  it('can bootstrap the default blueprint', async function() {
    let {
      status
    } = await (await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      bootstrap: true
    })).promise;

    assertNoStaged(status);

    expect(path.join(tmpPath, 'config/ember-cli-update.json')).to.be.a.file()
      .and.equal('test/fixtures/ember-cli-update-json/default/config/ember-cli-update.json');

    await fs.remove(path.join(tmpPath, 'config/ember-cli-update.json'));

    fixtureCompare({
      mergeFixtures: 'test/fixtures/app/local/my-app'
    });
  });

  it('can save an old blueprint\'s state', async function() {
    let [
      {
        packageName,
        version: base
      },
      {
        location,
        version: partial,
        outputRepo,
        codemodsSource,
        options
      }
    ] = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/local/my-app/config/ember-cli-update.json')).blueprints;

    let commitMessage = 'my-app';

    await (await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/init/local',
      commitMessage,
      save: true,
      from: base,
      blueprint: packageName
    })).promise;

    await initBlueprint({
      fixturesPath: path.resolve(__dirname, '../fixtures/blueprint/app/local'),
      resolvedFrom: tmpPath,
      relativeDir: location
    });

    let {
      status
    } = await (await processBin({
      binFile: 'ember-cli-update',
      args: [
        'save',
        `-b=${location}`,
        `--from=${partial}`,
        `--output-repo=${outputRepo}`,
        `--codemods-source=${codemodsSource}`,
        ...options
      ],
      cwd: tmpPath,
      commitMessage,
      expect
    })).promise;

    assertNoStaged(status);

    fixtureCompare({
      actual: path.join(tmpPath, 'config'),
      mergeFixtures: 'test/fixtures/blueprint/app/local-app/local/my-app/config'
    });
  });

  it('can show single blueprint stats', async function() {
    let {
      packageName,
      name,
      version: from
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/local/my-app/config/ember-cli-update.json')).blueprints[0];

    let {
      version: to
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/merge/my-app/config/ember-cli-update.json')).blueprints[0];

    let {
      ps,
      promise
    } = await merge({
      fixturesPath: 'test/fixtures/blueprint/app/local-app/local',
      commitMessage: 'my-app',
      stats: true,
      blueprint: packageName
    });

    let result = '';

    ps.stdout.on('data', data => {
      let str = data.toString();
      result += str;
    });

    let {
      status
    } = await promise;

    assertNoStaged(status);

    expect(result).to.equal(`package name: ${packageName}
blueprint name: ${name}
current version: ${from}
latest version: ${to}
`);
  });
});
