'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const utils = require('../../src/utils');
const runCodemod = require('../../src/run-codemod');

describe('Unit - runCodemod', function() {
  let sandbox;
  let npx;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    npx = sandbox.stub(utils, 'npx').resolves();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('works', function() {
    return runCodemod({
      commands: [
        'test command'
      ]
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

    return runCodemod({
      commands: [
        'test command 1',
        'test command 2'
      ]
    }).then(() => {
      expect(npx.args).to.deep.equal([
        ['test command 1'],
        ['test command 2']
      ]);
    });
  });

  it('continues if one codemod errors', function() {
    npx.withArgs('test command 1').rejects();
    let npx2 = npx.withArgs('test command 2').resolves();

    return runCodemod({
      commands: [
        'test command 1',
        'test command 2'
      ]
    }).then(() => {
      expect(npx2.calledOnce).to.be.ok;
    });
  });
});
