'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const utils = require('../../src/utils');
const runCodemods = require('../../src/run-codemods');

describe('Unit - runCodemods', function() {
  let sandbox;
  let getCodemods;
  let npx;
  let run;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    getCodemods = sandbox.stub(utils, 'getCodemods');
    sandbox.stub(utils, 'getNodeVersion').returns('4.0.0');
    npx = sandbox.stub(utils, 'npx').resolves();
    run = sandbox.stub(utils, 'run').resolves();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('works', function() {
    getCodemods.resolves({
      testCodemod: {
        version: '0.0.1',
        projectTypes: ['testProjectType'],
        nodeVersion: '4.0.0',
        commands: [
          'test command'
        ]
      }
    });

    return runCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1'
    }).then(() => {
      expect(npx.args).to.deep.equal([
        ['test command']
      ]);
    });
  });

  it('runs multiple commands sequentially', function() {
    getCodemods.resolves({
      testCodemod: {
        version: '0.0.1',
        projectTypes: ['testProjectType'],
        nodeVersion: '4.0.0',
        commands: [
          'test command 1',
          'test command 2'
        ]
      }
    });

    let npx1 = npx.withArgs('test command 1').callsFake(() => {
      return Promise.resolve().then(() => {
        expect(npx2.args).to.deep.equal([]);
      });
    });
    let npx2 = npx.withArgs('test command 2').callsFake(() => {
      return Promise.resolve().then(() => {
        expect(npx1.args).to.deep.equal([['test command 1']]);
      });
    });

    return runCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1'
    }).then(() => {
      expect(npx.args).to.deep.equal([
        ['test command 1'],
        ['test command 2']
      ]);
    });
  });

  it('stages files', function() {
    getCodemods.resolves({});

    return runCodemods({}).then(() => {
      expect(run.calledOnce).to.be.ok;
    });
  });

  it('continues if one codemod errors', function() {
    getCodemods.resolves({
      testCodemod1: {
        version: '0.0.1',
        projectTypes: ['testProjectType'],
        nodeVersion: '4.0.0',
        commands: [
          'test command 1'
        ]
      },
      testCodemod2: {
        version: '0.0.1',
        projectTypes: ['testProjectType'],
        nodeVersion: '4.0.0',
        commands: [
          'test command 2'
        ]
      }
    });

    npx.withArgs('test command 1').rejects();
    let npx2 = npx.withArgs('test command 2').resolves();

    return runCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1'
    }).then(() => {
      expect(npx2.calledOnce).to.be.ok;
    });
  });
});
