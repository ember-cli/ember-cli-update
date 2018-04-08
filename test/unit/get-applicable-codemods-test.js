'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const utils = require('../../src/utils');
const getApplicableCodemods = require('../../src/get-applicable-codemods');

describe('Unit - getApplicableCodemods', function() {
  let sandbox;
  let getCodemods;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    getCodemods = sandbox.stub(utils, 'getCodemods');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('works', function() {
    getCodemods.resolves({
      testCodemod: {
        version: '0.0.1',
        projectTypes: ['testProjectType']
      }
    });

    return getApplicableCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1'
    }).then(codemods => {
      expect(codemods).to.deep.equal({
        testCodemod: {
          version: '0.0.1',
          projectTypes: ['testProjectType']
        }
      });
    });
  });

  it('excludes wrong type', function() {
    getCodemods.resolves({
      testCodemod: {
        version: '0.0.1',
        projectTypes: ['testProjectType2']
      }
    });

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
        projectTypes: ['testProjectType']
      }
    });

    return getApplicableCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1'
    }).then(codemods => {
      expect(codemods).to.deep.equal({});
    });
  });
});
