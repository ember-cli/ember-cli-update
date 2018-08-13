'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const utils = require('../../src/utils');
const runCodemods = require('../../src/run-codemods');

describe('Unit - runCodemods', function() {
  let sandbox;
  let getApplicableCodemods;
  let runCodemod;
  let run;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    getApplicableCodemods = sandbox.stub(utils, 'getApplicableCodemods');
    runCodemod = sandbox.stub(utils, 'runCodemod').resolves();
    run = sandbox.stub(utils, 'run').resolves();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('works', function() {
    getApplicableCodemods.resolves({
      testCodemod: {
        commands: [
          'test command'
        ]
      }
    });

    return runCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1'
    }).then(() => {
      expect(getApplicableCodemods.args).to.deep.equal([[{
        projectType: 'testProjectType',
        startVersion: '0.0.1'
      }]]);

      expect(runCodemod.args).to.deep.equal([[{
        commands: [
          'test command'
        ]
      }]]);

      expect(run.calledOnce, 'stages files').to.be.ok;
    });
  });

  it('runs multiple commands sequentially', function() {
    let testCodemod1 = {
      commands: [
        'test command 1'
      ]
    };
    let testCodemod2 = {
      commands: [
        'test command 2'
      ]
    };
    getApplicableCodemods.resolves({
      testCodemod1,
      testCodemod2
    });

    let runCodemod1 = runCodemod.withArgs(testCodemod1).callsFake(() => {
      return Promise.resolve().then(() => {
        expect(runCodemod2.args).to.deep.equal([]);
      });
    });
    let runCodemod2 = runCodemod.withArgs(testCodemod2).callsFake(() => {
      return Promise.resolve().then(() => {
        expect(runCodemod1.args).to.deep.equal([[testCodemod1]]);
      });
    });

    return runCodemods({}).then(() => {
      expect(runCodemod.args).to.deep.equal([
        [testCodemod1],
        [testCodemod2]
      ]);
    });
  });
});
