'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const sinon = require('sinon');
const path = require('path');
const co = require('co');
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
      endVersion
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
        packageVersion: startVersion
      },
      endOptions: {
        packageVersion: endVersion
      }
    });
  });

  it('can create a project from cache', co.wrap(function*() {
    let { createProjectFromCache } = getStartAndEndCommands();

    let createProject = createProjectFromCache({
      packageRoot,
      options: {
        projectName
      }
    });

    expect(yield createProject(cwd)).to.equal(projectPath);

    expect(spawnStub.args).to.deep.equal([[
      'node',
      [
        path.normalize(`${packageRoot}/bin/${commandName}`),
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
  }));

  it('can create a project from remote', co.wrap(function*() {
    let { createProjectFromRemote } = getStartAndEndCommands();

    let createProject = createProjectFromRemote({
      options: {
        projectName,
        packageVersion
      }
    });

    expect(yield createProject(cwd)).to.equal(projectPath);

    expect(npxStub.args).to.deep.equal([[
      `-p ${packageName}@${packageVersion} ${commandName} new ${projectName} -sn -sg --no-welcome`,
      {
        cwd
      }
    ]]);
  }));

  describe('options', function() {
    let processOptions = co.wrap(function*(projectOptions) {
      let { createProjectFromCache } = getStartAndEndCommands({
        projectOptions
      });

      let createProject = createProjectFromCache({
        packageRoot,
        options: {
          projectName
        }
      });

      yield createProject(cwd);

      return spawnStub.args[0][1];
    });

    it('can create an app', co.wrap(function*() {
      expect(yield processOptions(['app'])).to.include('new');
    }));

    it('can create an addon', co.wrap(function*() {
      expect(yield processOptions(['addon'])).to.include('addon');
    }));

    it('cannot create a glimmer app', co.wrap(function*() {
      yield expect(processOptions(['glimmer']))
        .to.eventually.be.rejectedWith('cannot checkout older versions of glimmer blueprint');
    }));

    it('can create an app with the --no-welcome option', co.wrap(function*() {
      expect(yield processOptions(['app'])).to.include('--no-welcome');
    }));

    it('can create an app without the --no-welcome option', co.wrap(function*() {
      expect(yield processOptions(['app', 'welcome'])).to.not.include('--no-welcome');
    }));

    it('can create an app without the yarn option', co.wrap(function*() {
      expect(yield processOptions(['app'])).to.not.include('--yarn');
    }));

    it('can create an app with the yarn option', co.wrap(function*() {
      expect(yield processOptions(['app', 'yarn'])).to.include('--yarn');
    }));
  });
});
