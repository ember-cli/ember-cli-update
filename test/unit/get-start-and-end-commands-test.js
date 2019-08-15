'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const sinon = require('sinon');
const path = require('path');
const _getStartAndEndCommands = require('../../src/get-start-and-end-commands');
const utils = require('../../src/utils');

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

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    npxStub = sandbox.stub(utils, 'npx').resolves();
    spawnStub = sandbox.stub(utils, 'spawn').resolves();
  });

  afterEach(function() {
    sandbox.restore();
  });

  function getStartAndEndCommands(options) {
    return _getStartAndEndCommands(Object.assign({
      packageJson: { name: projectName },
      projectOptions: ['app'],
      startVersion,
      endVersion,
      startBlueprint: { name: 'ember-cli' },
      endBlueprint: { name: 'ember-cli' }
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
      projectOptions: ['app'],
      packageName,
      commandName,
      startOptions: {
        packageVersion: startVersion,
        blueprint: { name: 'ember-cli' }
      },
      endOptions: {
        packageVersion: endVersion,
        blueprint: { name: 'ember-cli' }
      }
    });
  });

  it('can create a project from cache', async function() {
    let { createProjectFromCache } = getStartAndEndCommands();

    let createProject = createProjectFromCache({
      packageRoot,
      options: {
        projectName
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
        '--no-welcome'
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
        packageVersion,
        blueprint: { name: 'ember-cli' }
      }
    });

    expect(await createProject(cwd)).to.equal(projectPath);

    expect(npxStub.args).to.deep.equal([[
      `-p ${packageName}@${packageVersion} ${commandName} new ${projectName} -sn -sg --no-welcome`,
      {
        cwd
      }
    ]]);
  });

  describe('custom blueprint', function() {
    it('returns an options object', async function() {
      let options = getStartAndEndCommands({
        projectOptions: ['blueprint']
      });

      expect(options.createProjectFromRemote).to.be.a('function');

      delete options.createProjectFromRemote;

      expect(options).to.deep.equal({
        projectName,
        projectOptions: ['blueprint'],
        startOptions: {
          packageVersion: startVersion,
          blueprint: { name: 'ember-cli' }
        },
        endOptions: {
          packageVersion: endVersion,
          blueprint: { name: 'ember-cli' }
        }
      });
    });

    it('can create a project from remote', async function() {
      let { createProjectFromRemote } = getStartAndEndCommands();

      let createProject = createProjectFromRemote({
        options: {
          projectName,
          packageVersion,
          blueprint: {
            name: blueprint,
            path: blueprintPath
          }
        }
      });

      expect(await createProject(cwd)).to.equal(projectPath);

      expect(npxStub.args).to.deep.equal([[
        `${packageName} new ${projectName} -sn -sg --no-welcome -b ${blueprintPath}`,
        {
          cwd
        }
      ]]);
    });
  });

  describe('options', function() {
    async function processOptions(projectOptions) {
      let options = getStartAndEndCommands({
        projectOptions
      });

      expect(options.projectOptions).to.deep.equal(projectOptions);

      let createProject = options.createProjectFromCache({
        packageRoot,
        options: {
          projectName
        }
      });

      await createProject(cwd);

      return spawnStub.args[0][1];
    }

    it('can create an app', async function() {
      expect(await processOptions(['app'])).to.include('new');
    });

    it('can create an addon', async function() {
      expect(await processOptions(['addon'])).to.include('addon');
    });

    it('cannot create a glimmer app', async function() {
      await expect(processOptions(['glimmer']))
        .to.eventually.be.rejectedWith('cannot checkout older versions of glimmer blueprint');
    });

    it('can create an app with the --no-welcome option', async function() {
      expect(await processOptions(['app'])).to.include('--no-welcome');
    });

    it('can create an app without the --no-welcome option', async function() {
      expect(await processOptions(['app', 'welcome'])).to.not.include('--no-welcome');
    });

    it('can create an app without the yarn option', async function() {
      expect(await processOptions(['app'])).to.not.include('--yarn');
    });

    it('can create an app with the yarn option', async function() {
      expect(await processOptions(['app', 'yarn'])).to.include('--yarn');
    });
  });
});
