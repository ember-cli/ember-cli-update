'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const utils = require('../../src/utils');
const getApplicableCodemods = require('../../src/get-applicable-codemods');

describe('Unit - getApplicableCodemods', function() {
  let sandbox;
  let getCodemods;
  let getNodeVersion;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    getCodemods = sandbox.stub(utils, 'getCodemods');
    getNodeVersion = sandbox.stub(utils, 'getNodeVersion');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('works', function() {
    getCodemods.resolves({
      testCodemod: {
        version: '0.0.1',
        projectTypes: ['testProjectType'],
        nodeVersion: '4.0.0'
      }
    });

    getNodeVersion.returns('4.0.0');

    return getApplicableCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1'
    }).then(codemods => {
      expect(codemods).to.deep.equal({
        testCodemod: {
          version: '0.0.1',
          projectTypes: ['testProjectType'],
          nodeVersion: '4.0.0'
        }
      });
    });
  });

  it('excludes wrong type', function() {
    getCodemods.resolves({
      testCodemod: {
        version: '0.0.1',
        projectTypes: ['testProjectType2'],
        nodeVersion: '4.0.0'
      }
    });

    getNodeVersion.returns('4.0.0');

    return getApplicableCodemods({
      projectType: 'testProjectType1',
      startVersion: '0.0.1'
    }).then(codemods => {
      expect(codemods).to.deep.equal({});
    });
  });

  it('excludes wrong version', function() {
    getCodemods.resolves({
      testCodemod: {
        version: '0.0.2',
        projectTypes: ['testProjectType'],
        nodeVersion: '4.0.0'
      }
    });

    getNodeVersion.returns('4.0.0');

    return getApplicableCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1'
    }).then(codemods => {
      expect(codemods).to.deep.equal({});
    });
  });

  it('excludes wrong node version', function() {
    getCodemods.resolves({
      testCodemod: {
        version: '0.0.1',
        projectTypes: ['testProjectType'],
        nodeVersion: '6.0.0'
      }
    });

    getNodeVersion.returns('4.0.0');

    return getApplicableCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1'
    }).then(codemods => {
      expect(codemods).to.deep.equal({});
    });
  });
});
