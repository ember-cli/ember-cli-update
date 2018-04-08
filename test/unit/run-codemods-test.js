'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const utils = require('../../src/utils');
const runCodemods = require('../../src/run-codemods');

describe('Unit - runCodemods', function() {
  let sandbox;
  let npx;
  let run;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    npx = sandbox.stub(utils, 'npx').resolves();
    run = sandbox.stub(utils, 'run').resolves();
  });

  afterEach(function() {
    sandbox.restore();
  });

  function _runCodemods(options) {
    let projectType = options.projectType;
    let startVersion = options.startVersion;
    let codemods = options.codemods;

    return runCodemods({
      projectType,
      startVersion,
      getCodemods() {
        return Promise.resolve(codemods);
      }
    });
  }

  it('works', function() {
    return _runCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1',
      codemods: {
        testCodemod: {
          version: '0.0.1',
          projectTypes: ['testProjectType'],
          commands: [
            'test command'
          ]
        }
      }
    }).then(() => {
      expect(npx.args).to.deep.equal([
        ['test command']
      ]);
    });
  });

  it('runs multiple commands sequentially', function() {
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

    return _runCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1',
      codemods: {
        testCodemod: {
          version: '0.0.1',
          projectTypes: ['testProjectType'],
          commands: [
            'test command 1',
            'test command 2'
          ]
        }
      }
    }).then(() => {
      expect(npx.args).to.deep.equal([
        ['test command 1'],
        ['test command 2']
      ]);
    });
  });

  it('stages files', function() {
    return _runCodemods({
      codemods: {}
    }).then(() => {
      expect(run.calledOnce).to.be.ok;
    });
  });
});
