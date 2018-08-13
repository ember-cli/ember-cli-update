'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const utils = require('../../src/utils');
const runCodemods = require('../../src/run-codemods');

describe('Unit - runCodemods', function() {
  let sandbox;
  let runCodemod;
  let run;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    runCodemod = sandbox.stub(utils, 'runCodemod').resolves();
    run = sandbox.stub(utils, 'run').resolves();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('works', function() {
    return runCodemods({
      testCodemod: {
        commands: [
          'test command'
        ]
      }
    }).then(() => {
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

    return runCodemods({
      testCodemod1,
      testCodemod2
    }).then(() => {
      expect(runCodemod.args).to.deep.equal([
        [testCodemod1],
        [testCodemod2]
      ]);
    });
  });
});
