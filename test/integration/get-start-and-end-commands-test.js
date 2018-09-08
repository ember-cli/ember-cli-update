'use strict';

const { expect } = require('chai');
const tmp = require('tmp');
const sinon = require('sinon');
const _getStartAndEndCommands = require('../../src/get-start-and-end-commands');
const utils = require('../../src/utils');
const _buildTmp = require('../helpers/build-tmp');

const {
  createRemoteCommand: _createRemoteCommand,
  createLocalCommand: _createLocalCommand
} = _getStartAndEndCommands;

const projectName = 'my-custom-app';
const command = 'test command';
const remoteCommand = 'test remote command';
const localCommand = 'test local command';
const startVersion = '2.11.1';
const endVersion = '0.0.0';

describe('Integration - getStartAndEndCommands', function() {
  this.timeout(60 * 1000);

  let sandbox;
  let createRemoteCommandStub;
  let createLocalCommandStub;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    createLocalCommandStub = sandbox.stub(_getStartAndEndCommands, 'createLocalCommand').resolves(localCommand);
    createRemoteCommandStub = sandbox.stub(_getStartAndEndCommands, 'createRemoteCommand').resolves(remoteCommand);
  });

  afterEach(function() {
    sandbox.restore();
  });

  function getStartAndEndCommands(options) {
    return _getStartAndEndCommands(Object.assign({
      projectName,
      startVersion,
      endVersion
    }, options));
  }

  it('works for app', function() {
    return getStartAndEndCommands({
      projectType: 'app'
    }).then(({
      startCommand,
      endCommand
    }) => {
      expect(createLocalCommandStub.args).to.deep.equal([
        [projectName, `new ${projectName}`, startVersion]
      ]);
      expect(createRemoteCommandStub.args).to.deep.equal([
        [projectName, `new ${projectName}`, endVersion]
      ]);

      expect(startCommand).to.be.a('string');
      expect(endCommand).to.be.a('string');
    });
  });

  it('works for addon', function() {
    return getStartAndEndCommands({
      projectType: 'addon'
    }).then(({
      startCommand,
      endCommand
    }) => {
      expect(createLocalCommandStub.args).to.deep.equal([
        [projectName, `addon ${projectName}`, startVersion]
      ]);
      expect(createRemoteCommandStub.args).to.deep.equal([
        [projectName, `addon ${projectName}`, endVersion]
      ]);

      expect(startCommand).to.be.a('string');
      expect(endCommand).to.be.a('string');
    });
  });

  it('throws for glimmer', function() {
    expect(() => getStartAndEndCommands({
      projectType: 'glimmer'
    })).to.throw('cannot checkout older versions of glimmer blueprint');

    expect(createLocalCommandStub.called).to.not.be.ok;
    expect(createRemoteCommandStub.called).to.not.be.ok;
  });

  describe('createRemoteCommand', function() {
    let npxStub;

    beforeEach(function() {
      npxStub = sandbox.stub(utils, 'npx').resolves();
    });

    function createRemoteCommand() {
      return _createRemoteCommand(projectName, command, endVersion);
    }

    it('works', function() {
      return createRemoteCommand().then(_command => {
        let [arg] = npxStub.args[0];
        expect(arg).to.contain(endVersion);
        expect(arg).to.contain(command);

        expect(_command).to.be.a('string');
      });
    });
  });

  describe('createLocalCommand', function() {
    let cwd;
    let tmpPath;
    let runStub;

    before(function() {
      cwd = process.cwd();
    });

    beforeEach(function() {
      tmpPath = tmp.dirSync().name;

      runStub = sandbox.stub(utils, 'run');
    });

    afterEach(function() {
      process.chdir(cwd);
    });

    function buildTmp(options) {
      _buildTmp(Object.assign({
        fixturesPath: 'test/fixtures/local/my-custom-app',
        tmpPath
      }, options));

      process.chdir(tmpPath);
    }

    function createLocalCommand() {
      return _createLocalCommand(projectName, command, startVersion);
    }

    it('falls back to remote copy if ember-cli is missing', function() {
      buildTmp();

      return createLocalCommand().then(_command => {
        expect(runStub.called).to.not.be.ok;

        expect(createRemoteCommandStub.args).to.deep.equal([
          [projectName, command, startVersion]
        ]);

        expect(_command).to.be.a('string');
      });
    });

    it('falls back to remote copy if ember-cli is wrong version', function() {
      buildTmp({
        npmInstall: 'latest'
      });

      return createLocalCommand().then(_command => {
        expect(runStub.called).to.not.be.ok;

        expect(createRemoteCommandStub.args).to.deep.equal([
          [projectName, command, startVersion]
        ]);

        expect(_command).to.be.a('string');
      });
    });

    it('uses local copy if ember-cli exists and same version', function() {
      buildTmp({
        npmInstall: true
      });

      return createLocalCommand().then(_command => {
        let [arg] = runStub.args[0];
        expect(arg).to.not.contain(startVersion);
        expect(arg).to.contain(command);

        expect(createRemoteCommandStub.called).to.not.be.ok;

        expect(_command).to.be.a('string');
      });
    });
  });
});
