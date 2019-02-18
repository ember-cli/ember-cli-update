'use strict';

const { describe, it } = require('../helpers/mocha');
const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const _getStartAndEndCommands = require('../../src/get-start-and-end-commands');
const utils = require('../../src/utils');

chai.use(require('chai-as-promised'));
const { expect } = chai;

const {
  createRemoteCommand: _createRemoteCommand,
  createLocalCommand: _createLocalCommand,
  createGlobalCommand: _createGlobalCommand
} = _getStartAndEndCommands;

const projectName = 'my-custom-app';
const command = 'test command';
const remoteCommand = 'test remote command';
const localCommand = 'test local command';
const globalCommand = 'test remote command';
const startVersion = '0.0.1';
const endVersion = '0.0.2';

describe.skip(_getStartAndEndCommands, function() {
  let sandbox;
  let createRemoteCommandStub;
  let createLocalCommandStub;
  let createGlobalCommandStub;
  let whichStub;
  let resolveStub;
  let requireStub;
  let runStub;
  let npxStub;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    createLocalCommandStub = sandbox.stub(_getStartAndEndCommands, 'createLocalCommand').resolves(localCommand);
    createRemoteCommandStub = sandbox.stub(_getStartAndEndCommands, 'createRemoteCommand').resolves(remoteCommand);
    createGlobalCommandStub = sandbox.stub(_getStartAndEndCommands, 'createGlobalCommand').resolves(globalCommand);
    whichStub = sandbox.stub(utils, 'which').resolves('/path/to/bin/ember');
    resolveStub = sandbox.stub(utils, 'resolve');
    requireStub = sandbox.stub(utils, 'require').withArgs(path.resolve('/path/to/package.json'));
    runStub = sandbox.stub(utils, 'run');
    npxStub = sandbox.stub(utils, 'npx').resolves();
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
      projectOptions: ['app']
    }).then(({
      startCommand,
      endCommand
    }) => {
      expect(createLocalCommandStub.args).to.deep.equal([
        [projectName, `new ${projectName}`, startVersion]
      ]);
      expect(createGlobalCommandStub.args).to.deep.equal([
        [projectName, `new ${projectName}`, endVersion]
      ]);

      expect(startCommand).to.be.a('string');
      expect(endCommand).to.be.a('string');
    });
  });

  it('works for addon', function() {
    return getStartAndEndCommands({
      projectOptions: ['addon']
    }).then(({
      startCommand,
      endCommand
    }) => {
      expect(createLocalCommandStub.args).to.deep.equal([
        [projectName, `addon ${projectName}`, startVersion]
      ]);
      expect(createGlobalCommandStub.args).to.deep.equal([
        [projectName, `addon ${projectName}`, endVersion]
      ]);

      expect(startCommand).to.be.a('string');
      expect(endCommand).to.be.a('string');
    });
  });

  it('throws for glimmer', function() {
    expect(() => getStartAndEndCommands({
      projectOptions: ['glimmer']
    })).to.throw('cannot checkout older versions of glimmer blueprint');

    expect(createLocalCommandStub.called).to.not.be.ok;
    expect(createGlobalCommandStub.called).to.not.be.ok;
  });

  describe('createRemoteCommand', function() {
    function createRemoteCommand() {
      return _createRemoteCommand(projectName, command, endVersion);
    }

    it('works', function() {
      return createRemoteCommand().then(_command => {
        expect(npxStub.args[0][0]).to.contain(command).and.contain(endVersion);

        expect(_command).to.be.a('string');
      });
    });
  });

  describe('createLocalCommand', function() {
    function createLocalCommand() {
      return _createLocalCommand(projectName, command, startVersion);
    }

    it('falls back to remote copy if ember-cli is missing', function() {
      resolveStub.rejects({ code: 'MODULE_NOT_FOUND' });

      return createLocalCommand().then(_command => {
        expect(runStub.called).to.not.be.ok;

        expect(createRemoteCommandStub.args).to.deep.equal([
          [projectName, command, startVersion]
        ]);

        expect(_command).to.be.a('string');
      });
    });

    it('throws if fails for another reason', function() {
      resolveStub.rejects({ code: 'test code' });

      return expect(createLocalCommand()).to.eventually.be.rejected
        .and.have.property('code', 'test code')
        .then(() => {
          expect(runStub.called).to.not.be.ok;

          expect(createRemoteCommandStub.called).to.not.be.ok;
        });
    });

    it('falls back to remote copy if ember-cli is wrong version', function() {
      resolveStub.withArgs('ember-cli', { basedir: process.cwd() })
        .resolves('/path/to/lib/cli/index.js');
      requireStub.returns({
        version: endVersion
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
      resolveStub.withArgs('ember-cli', { basedir: process.cwd() })
        .resolves('/path/to/lib/cli/index.js');
      requireStub.returns({
        version: startVersion
      });

      return createLocalCommand().then(_command => {
        expect(runStub.args[0][0]).to.contain(command).and.not.contain(startVersion);

        expect(createRemoteCommandStub.called).to.not.be.ok;

        expect(_command).to.be.a('string');
      });
    });
  });

  describe('createGlobalCommand', function() {
    function createGlobalCommand() {
      return _createGlobalCommand(projectName, command, endVersion);
    }

    it('falls back to remote copy if ember-cli is missing', function() {
      whichStub.rejects({ message: 'not found: ember' });

      return createGlobalCommand().then(_command => {
        expect(runStub.called).to.not.be.ok;

        expect(createRemoteCommandStub.args).to.deep.equal([
          [projectName, command, endVersion]
        ]);

        expect(_command).to.be.a('string');
      });
    });

    it('throws if fails for another reason', function() {
      whichStub.rejects({ message: 'test message' });

      return expect(createGlobalCommand()).to.eventually.be.rejectedWith('test message')
        .then(() => {
          expect(runStub.called).to.not.be.ok;

          expect(createRemoteCommandStub.called).to.not.be.ok;
        });
    });

    it('falls back to remote copy if ember-cli is wrong version', function() {
      resolveStub.withArgs('ember-cli', { basedir: path.resolve('/path/to/lib') })
        .resolves('/path/to/lib/cli/index.js');
      requireStub.returns({
        version: startVersion
      });

      return createGlobalCommand().then(_command => {
        expect(runStub.called).to.not.be.ok;

        expect(createRemoteCommandStub.args).to.deep.equal([
          [projectName, command, endVersion]
        ]);

        expect(_command).to.be.a('string');
      });
    });

    it('uses local copy if ember-cli exists and same version', function() {
      resolveStub.withArgs('ember-cli', { basedir: path.resolve('/path/to/lib') })
        .resolves('/path/to/lib/cli/index.js');
      requireStub.returns({
        version: endVersion
      });

      return createGlobalCommand().then(_command => {
        expect(runStub.args[0][0]).to.contain(command).and.not.contain(endVersion);

        expect(createRemoteCommandStub.called).to.not.be.ok;

        expect(_command).to.be.a('string');
      });
    });
  });
});
