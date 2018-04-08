'use strict';

const expect = require('chai').expect;
const getApplicableCodemods = require('../../src/get-applicable-codemods');

function _getApplicableCodemods(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;
  let codemods = options.codemods;

  return getApplicableCodemods({
    projectType,
    startVersion,
    getCodemods() {
      return Promise.resolve(codemods);
    }
  });
}

describe('Unit - getApplicableCodemods', function() {
  it('works', function() {
    return _getApplicableCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1',
      codemods: {
        testCodemod: {
          version: '0.0.1',
          projectTypes: ['testProjectType']
        }
      }
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
    return _getApplicableCodemods({
      projectType: 'testProjectType1',
      startVersion: '0.0.1',
      codemods: {
        testCodemod: {
          version: '0.0.1',
          projectTypes: ['testProjectType2']
        }
      }
    }).then(codemods => {
      expect(codemods).to.deep.equal({});
    });
  });

  it('excludes wrong version', function() {
    return _getApplicableCodemods({
      projectType: 'testProjectType',
      startVersion: '0.0.1',
      codemods: {
        testCodemod: {
          version: '0.0.2',
          projectTypes: ['testProjectType']
        }
      }
    }).then(codemods => {
      expect(codemods).to.deep.equal({});
    });
  });
});
