'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const sinon = require('sinon');
const path = require('path');
const _getStartAndEndCommands = require('../../src/get-start-and-end-commands');
const utils = require('../../src/utils');
const loadSafeBlueprint = require('../../src/load-safe-blueprint');

const {
  getArgs
} = _getStartAndEndCommands;

const projectName = 'my-custom-app';
const startVersion = '0.0.1';
const endVersion = '0.0.2';
const packageRoot = '/test/package/root';
const packageVersion = startVersion;
const cwd = '/test/cwd';
const packageName = 'ember-cli';
const commandName = 'ember';
const blueprint = 'test-blueprint';
const blueprintPath = '/path/to/blueprint';
const projectPath = path.normalize(`${cwd}/${projectName}`);

describe(_getStartAndEndCommands, function() {
  let sandbox;
  let npxStub;
  let spawnStub;
  let readdirStub;
  let installAddonBlueprintStub;
  let createEmptyCommitStub;
  let appendNodeModulesIgnoreStub;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    npxStub = sandbox.stub(utils, 'npx').resolves();
    spawnStub = sandbox.stub(utils, 'spawn').resolves();
    readdirStub = sandbox.stub(utils, 'readdir').resolves(['foo']);
    installAddonBlueprintStub = sandbox.stub(_getStartAndEndCommands, 'installAddonBlueprint').resolves();
    createEmptyCommitStub = sandbox.stub(_getStartAndEndCommands, 'createEmptyCommit').resolves();
    appendNodeModulesIgnoreStub = sandbox.stub(_getStartAndEndCommands, 'appendNodeModulesIgnore').resolves();
  });

  afterEach(function() {
    sandbox.restore();
  });

  function getStartAndEndCommands(options) {
    return _getStartAndEndCommands(Object.assign({
      packageJson: { name: projectName },
      startBlueprint: {
        name: 'ember-cli',
        version: startVersion
      },
      endBlueprint: {
        name: 'ember-cli',
        version: endVersion
      }
    }, options));
  }

  it('returns an options object', function() {
    let options = getStartAndEndCommands();

    expect(options.createProjectFromCache).to.be.a('function');
    expect(options.createProjectFromRemote).to.be.a('function');

    delete options.createProjectFromCache;
    delete options.createProjectFromRemote;

    expect(options).to.deep.equal({
      projectName,
      packageName,
      commandName,
      startOptions: {
        blueprint: {
          name: 'ember-cli',
          version: startVersion
        },
        packageVersion: startVersion
      },
      endOptions: {
        blueprint: {
          name: 'ember-cli',
          version: endVersion
        },
        packageVersion: endVersion
      }
    });
  });

  it('can create a project from cache', async function() {
    let { createProjectFromCache } = getStartAndEndCommands();

    let createProject = createProjectFromCache({
      packageRoot,
      options: {
        projectName,
        blueprint: loadSafeBlueprint({
          name: 'ember-cli'
        })
      }
    });

    expect(await createProject(cwd)).to.equal(projectPath);

    expect(spawnStub.args).to.deep.equal([[
      'node',
      [
        path.normalize(`${packageRoot}/bin/ember`),
        'new',
        projectName,
        '-sn',
        '-sg',
        '-b',
        'app'
      ],
      {
        cwd
      }
    ]]);
  });

  it('can create a project from remote', async function() {
    let { createProjectFromRemote } = getStartAndEndCommands();

    let createProject = createProjectFromRemote({
      options: {
        projectName,
        blueprint: loadSafeBlueprint({
          name: 'ember-cli',
          version: packageVersion
        })
      }
    });

    expect(await createProject(cwd)).to.equal(projectPath);

    expect(npxStub.args).to.deep.equal([[
      `-p ${packageName}@${packageVersion} ${commandName} new ${projectName} -sn -sg -b app`,
      {
        cwd
      }
    ]]);
  });

  describe('custom blueprint', function() {
    it('returns an options object', async function() {
      let options = getStartAndEndCommands({
        startBlueprint: {
          name: blueprint,
          version: startVersion
        },
        endBlueprint: {
          name: blueprint,
          version: endVersion
        }
      });

      expect(options.createProjectFromRemote).to.be.a('function');

      delete options.createProjectFromRemote;

      expect(options).to.deep.equal({
        projectName,
        startOptions: {
          blueprint: {
            name: blueprint,
            version: startVersion
          },
          packageVersion: startVersion
        },
        endOptions: {
          blueprint: {
            name: blueprint,
            version: endVersion
          },
          packageVersion: endVersion
        }
      });
    });

    it('can create a project from remote', async function() {
      let { createProjectFromRemote } = getStartAndEndCommands();

      let createProject = createProjectFromRemote({
        options: {
          projectName,
          blueprint: loadSafeBlueprint({
            name: blueprint,
            version: packageVersion,
            path: blueprintPath
          })
        }
      });

      expect(await createProject(cwd)).to.equal(projectPath);

      expect(npxStub.args).to.deep.equal([[
        `${packageName} new ${projectName} -sn -sg -b ${blueprintPath}`,
        {
          cwd
        }
      ]]);

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        cwd,
        projectName
      }]]);
    });

    it('can install an addon blueprint', async function() {
      let { createProjectFromRemote } = getStartAndEndCommands();

      readdirStub.resolves([]);

      let createProject = createProjectFromRemote({
        options: {
          projectName,
          blueprint: loadSafeBlueprint({
            name: blueprint,
            version: packageVersion,
            path: blueprintPath
          })
        }
      });

      expect(await createProject(cwd)).to.equal(projectPath);

      expect(installAddonBlueprintStub.args).to.deep.equal([[{
        cwd,
        projectName,
        blueprintPath
      }]]);

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        cwd,
        projectName
      }]]);
    });
  });

  describe('init blueprint', function() {
    it('returns an options object - default', function() {
      let options = getStartAndEndCommands({
        startBlueprint: null
      });

      expect(options.createProjectFromCache).to.be.a('function');
      expect(options.createProjectFromRemote).to.be.a('function');

      delete options.createProjectFromCache;
      delete options.createProjectFromRemote;

      expect(options).to.deep.equal({
        projectName,
        packageName,
        commandName,
        startOptions: {
          blueprint: null,
          packageVersion: null
        },
        endOptions: {
          blueprint: {
            name: 'ember-cli',
            version: endVersion
          },
          packageVersion: endVersion
        }
      });
    });

    it('returns an options object - custom', async function() {
      let options = getStartAndEndCommands({
        startBlueprint: null,
        endBlueprint: {
          name: blueprint,
          version: endVersion
        }
      });

      expect(options.createProjectFromRemote).to.be.a('function');

      delete options.createProjectFromRemote;

      expect(options).to.deep.equal({
        projectName,
        startOptions: {
          blueprint: null,
          packageVersion: null
        },
        endOptions: {
          blueprint: {
            name: blueprint,
            version: endVersion
          },
          packageVersion: endVersion
        }
      });
    });

    it('can create the initial empty commit', async function() {
      let { createProjectFromRemote } = getStartAndEndCommands();

      let createProject = createProjectFromRemote({
        options: {
          projectName
        }
      });

      expect(await createProject(cwd)).to.equal(projectPath);

      expect(createEmptyCommitStub.args).to.deep.equal([[{
        cwd,
        projectName
      }]]);
    });

    it('can use the default blueprint', async function() {
      let { createProjectFromRemote } = getStartAndEndCommands();

      let createProject = createProjectFromRemote({
        options: {
          projectName,
          blueprint: loadSafeBlueprint({
            name: 'ember-cli',
            version: packageVersion,
            path: blueprintPath
          })
        }
      });

      expect(await createProject(cwd)).to.equal(projectPath);

      expect(npxStub.args).to.deep.equal([[
        `-p ${packageName}@${packageVersion} ${commandName} new ${projectName} -sn -sg -b app`,
        {
          cwd
        }
      ]]);

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub).to.not.be.called;
    });

    it('can use a custom blueprint', async function() {
      let { createProjectFromRemote } = getStartAndEndCommands();

      let createProject = createProjectFromRemote({
        options: {
          projectName,
          blueprint: loadSafeBlueprint({
            name: blueprint,
            version: packageVersion,
            path: blueprintPath
          })
        }
      });

      expect(await createProject(cwd)).to.equal(projectPath);

      expect(npxStub.args).to.deep.equal([[
        `${packageName} new ${projectName} -sn -sg -b ${blueprintPath}`,
        {
          cwd
        }
      ]]);

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        cwd,
        projectName
      }]]);
    });
  });

  describe('options', function() {
    async function processBlueprint(blueprint) {
      let defaultBlueprint = {
        name: 'ember-cli',
        ...blueprint
      };

      let options = getStartAndEndCommands({
        startBlueprint: defaultBlueprint,
        endBlueprint: defaultBlueprint
      });

      expect(options.startOptions.blueprint).to.deep.equal(defaultBlueprint);
      expect(options.endOptions.blueprint).to.deep.equal(defaultBlueprint);

      let createProject = options.createProjectFromCache({
        packageRoot,
        options: {
          projectName,
          blueprint: loadSafeBlueprint(defaultBlueprint)
        }
      });

      await createProject(cwd);

      return spawnStub.args[0][1];
    }

    it('can create an app', async function() {
      expect(await processBlueprint()).to.include('new');
    });

    it('can create an addon', async function() {
      expect(await processBlueprint({ type: 'addon' })).to.include('addon');
    });

    it('can create an app with the --no-welcome option', async function() {
      expect(await processBlueprint({ options: ['--no-welcome'] })).to.include('--no-welcome');
    });

    it('can create an app without the --no-welcome option', async function() {
      expect(await processBlueprint()).to.not.include('--no-welcome');
    });

    it('can create an app without the yarn option', async function() {
      expect(await processBlueprint()).to.not.include('--yarn');
    });

    it('can create an app with the yarn option', async function() {
      expect(await processBlueprint({ options: ['--yarn'] })).to.include('--yarn');
    });
  });

  describe(getArgs, function() {
    let projectName = 'my-project';

    it('works for default app', function() {
      let blueprint = {
        name: 'ember-cli',
        type: 'app',
        options: []
      };

      let args = getArgs(projectName, blueprint);

      expect(args).to.deep.equal([
        'new',
        'my-project',
        '-sn',
        '-sg',
        '-b',
        'app'
      ]);
    });

    it('works for default addon', function() {
      let blueprint = {
        name: 'ember-cli',
        type: 'addon',
        options: []
      };

      let args = getArgs(projectName, blueprint);

      expect(args).to.deep.equal([
        'new',
        'my-project',
        '-sn',
        '-sg',
        '-b',
        'addon'
      ]);
    });

    it('works for custom app', function() {
      let blueprint = {
        name: 'my-blueprint',
        path: '/path/to/my-blueprint',
        options: []
      };

      let args = getArgs(projectName, blueprint);

      expect(args).to.deep.equal([
        'new',
        'my-project',
        '-sn',
        '-sg',
        '-b',
        '/path/to/my-blueprint'
      ]);
    });

    it('handles options', function() {
      let blueprint = {
        name: 'ember-cli',
        type: 'app',
        options: [
          '--my-option-1',
          '--my-option-2'
        ]
      };

      let args = getArgs(projectName, blueprint);

      expect(args).to.deep.equal([
        'new',
        'my-project',
        '-sn',
        '-sg',
        '-b',
        'app',
        '--my-option-1',
        '--my-option-2'
      ]);
    });
  });
});
