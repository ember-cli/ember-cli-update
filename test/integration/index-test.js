'use strict';

const fs = require('fs-extra');
const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const sinon = require('sinon');
const {
  buildTmp,
  processExit,
  fixtureCompare: _fixtureCompare,
  commit
} = require('git-fixtures');
const { isGitClean } = require('git-diff-apply');
const emberCliUpdate = require('../../src');
const {
  assertNoUnstaged
} = require('../helpers/assertions');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const {
  defaultPackageName,
  defaultAddonBlueprintName,
  defaultTo
} = require('../../src/constants');
const { EOL } = require('os');
const installAndGenerateBlueprint = require('../../src/install-and-generate-blueprint');
const cliUpdateCommandModule = require('../../src/index');
const getStartAndEndModule = require('../../src/get-start-and-end-commands');

describe(function() {
  this.timeout(30 * 1000);

  let tmpPath;

  afterEach(function() {
    sinon.restore();
  });

  async function merge({
    fixturesPath,
    dirty,
    packageName,
    blueprint,
    from,
    to = '3.11.0-beta.1',
    commitMessage,
    beforeMerge = () => Promise.resolve(),
    afterMerge = () => Promise.resolve()
  }) {
    tmpPath = await buildTmp({
      fixturesPath,
      dirty
    });

    await beforeMerge();

    let promise = (async() => {
      let result = await (await emberCliUpdate({
        cwd: tmpPath,
        packageName,
        blueprint,
        from,
        to
      })).promise;

      await afterMerge();

      return result;
    })();

    return await processExit({
      promise,
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

  it('handles dirty', async function() {
    let {
      status,
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      dirty: true
    });

    expect(status).to.equal(`?? a-random-new-file
`);

    expect(stderr).to.contain('You must start with a clean working directory');
    expect(stderr).to.not.contain('UnhandledPromiseRejectionWarning');
  });

  it('handles non-ember-cli app', async function() {
    let promise = merge({
      fixturesPath: 'test/fixtures/package-json/non-ember-cli',
      commitMessage: 'my-app'
    });

    await expect(promise)
      .to.eventually.be.rejectedWith('Ember CLI project type could not be determined');

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;
  });

  it('handles non-npm dir', async function() {
    let {
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/package-json/missing',
      commitMessage: 'my-app'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(stderr).to.contain('No package.json was found in this directory');
  });

  it('handles malformed package.json', async function() {
    let {
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/package-json/malformed',
      commitMessage: 'my-app'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(stderr).to.contain('The package.json is malformed');
  });

  it('updates glimmer app', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/glimmer/local',
      commitMessage: 'glimmer-app',
      from: '0.5.0',
      to: '0.6.1'
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/glimmer/merge/glimmer-app'
    });

    expect(status).to.match(/^M {2}src\/index\.ts$/m);

    assertNoUnstaged(status);
  });

  it('needs --from if glimmer app before 0.6.3', async function() {
    let {
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/glimmer/local',
      commitMessage: 'glimmer-app',
      to: '0.6.1'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(stderr).to.contain('version cannot be determined');
  });

  it('updates addon', async function() {
    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/addon/local',
      commitMessage: 'my-addon'
    });

    fixtureCompare({
      mergeFixtures: 'test/fixtures/addon/merge/my-addon'
    });

    assertNoUnstaged(status);
  });

  describe('blueprints', function() {
    describe('--blueprint', function() {
      it('throws if missing --from', async function() {
        let promise = merge({
          fixturesPath: 'test/fixtures/app/local',
          commitMessage: 'my-app',
          blueprint: 'test-blueprint'
        });

        await expect(promise).to.eventually.be.rejectedWith('A custom blueprint cannot detect --from. You must supply it.');

        expect(await isGitClean({ cwd: tmpPath })).to.be.ok;
      });

      it('can update a legacy blueprint', async function() {
        let {
          location,
          version: to
        } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/legacy-app/merge/my-app/config2/ember-cli-update.json')).blueprints[1];

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/blueprint/app/legacy-app/local',
          commitMessage: 'my-app',
          blueprint: location,
          to,
          async beforeMerge() {
            await initBlueprint({
              fixturesPath: 'test/fixtures/blueprint/app/legacy',
              resolvedFrom: tmpPath,
              relativeDir: location
            });
          }
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/blueprint/app/legacy-app/merge/my-app'
        });

        assertNoUnstaged(status);
      });

      it('can update a default blueprint by name', async function() {
        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/addon/local',
          commitMessage: 'my-addon',
          packageName: defaultPackageName,
          blueprint: defaultAddonBlueprintName
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/addon/merge/my-addon'
        });

        assertNoUnstaged(status);
      });

      it('can update a custom blueprint for an ember app project', async function() {
        let originalSpawn = installAndGenerateBlueprint.spawn;
        let originalResolvePackage = cliUpdateCommandModule.resolvePackage;
        let originalIsDefaultAddonBlueprint = getStartAndEndModule.isDefaultAddonBlueprint;
        let fakeAddonName = 'some-addon-with-blueprint';

        sinon.stub(getStartAndEndModule, 'isDefaultAddonBlueprint').callsFake((blueprint) => {
          if (blueprint.packageName === fakeAddonName) {
            return true;
          }
          return originalIsDefaultAddonBlueprint(blueprint);
        });
        // Mock this for the fake addon
        sinon.stub(cliUpdateCommandModule, 'resolvePackage').callsFake(({ name, url, range }) => {
          if (name  === fakeAddonName) {
            return {
              version: range,
              path: ''
            };
          } else {
            return originalResolvePackage({ name, url, range });
          }
        });
        // Mock out the spawn to install a local blueprint
        sinon.stub(installAndGenerateBlueprint, 'spawn').callsFake((bin, args, options) => {
          if (args.some(arg => {
            return arg.indexOf(fakeAddonName) > -1;
          })
          ) {
            let [installCmd, saveDev, resolvedPackageName] = args;
            let packageNameAndVersion = resolvedPackageName.split('@');
            let absolutePath = path.resolve(path.join('test/fixtures/blueprint/addon/legacy', `v${packageNameAndVersion[1]}`));
            return originalSpawn(bin, [installCmd, saveDev, absolutePath], options);
          } else {
            return originalSpawn(bin, args, options);
          }
        });

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/app/simple-app-custom-blueprint-test',
          commitMessage: 'my-app',
          packageName: fakeAddonName,
          from: '0.0.1',
          to: '0.0.2',
          blueprint: 'custom-blueprint'
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/app/simple-app-custom-blueprint-test-merge/my-app'
        });

        assertNoUnstaged(status);
      });

      it('ignores package.json version of ember-cli', async function() {
        let {
          packageName,
          name: blueprint
        } = (await loadSafeBlueprintFile('test/fixtures/ember-cli-update-json/addon/config/ember-cli-update.json')).blueprints[0];

        let commitMessage = 'my-addon';

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/addon/local',
          commitMessage,
          packageName,
          blueprint,
          // from: '2.11.1',
          async beforeMerge() {
            await fs.copy(
              path.resolve(__dirname, '../fixtures/ember-cli-update-json/addon/config/ember-cli-update.json'),
              path.join(tmpPath, 'tests/dummy/config/ember-cli-update.json')
            );

            let packageJsonPath = path.join(tmpPath, 'package.json');
            let packageJson = require(packageJsonPath);
            packageJson.devDependencies['ember-cli'] = '~3.11.0-beta.1';
            await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + EOL);

            await commit({ m: commitMessage, cwd: tmpPath });
          }
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/addon/merge/my-addon'
        });

        assertNoUnstaged(status);
      });
    });

    describe('ember-cli-update.json', function() {
      it('can update a remote blueprint', async function() {
        let {
          name,
          version: to
        } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/remote-app/merge/my.app/config/ember-cli-update.json')).blueprints[0];

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/blueprint/app/remote-app/local',
          commitMessage: 'my.app',
          blueprint: name,
          to
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/blueprint/app/remote-app/merge/my.app'
        });

        assertNoUnstaged(status);
      });

      it('can update an npm blueprint', async function() {
        let [
          {
            location
          },
          {
            name
          }
        ] = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/npm-app/merge/my-app/config/ember-cli-update.json')).blueprints;

        let {
          status
        } = await merge({
          fixturesPath: 'test/fixtures/blueprint/app/npm-app/local',
          commitMessage: 'my-app',
          blueprint: name,
          to: defaultTo,
          async beforeMerge() {
            // test local base blueprints
            await initBlueprint({
              fixturesPath: 'test/fixtures/blueprint/app/local',
              resolvedFrom: tmpPath,
              relativeDir: location
            });
          }
        });

        fixtureCompare({
          mergeFixtures: 'test/fixtures/blueprint/app/npm-app/merge/my-app'
        });

        assertNoUnstaged(status);
      });
    });
  });
});
