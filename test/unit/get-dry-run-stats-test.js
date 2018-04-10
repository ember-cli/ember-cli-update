'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const utils = require('../../src/utils');
const getDryRunStats = require('../../src/get-dry-run-stats');

describe('Unit - getDryRunStats', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('gives versions', function() {
    return getDryRunStats({
      startVersion: '123',
      endVersion: '456'
    }).then(message => {
      expect(message).to.equal(
        'Would update from 123 to 456.'
      );
    });
  });

  it('gives codemods', function() {
    sandbox.stub(utils, 'getCodemods').resolves({
      testCodemod1: {
        version: '0.0.1',
        projectTypes: ['testProjectType']
      },
      testCodemod2: {
        version: '0.0.1',
        projectTypes: ['testProjectType']
      },
      testCodemod3: {
        version: '0.0.2',
        projectTypes: ['testProjectType']
      }
    });

    return getDryRunStats({
      projectType: 'testProjectType',
      startVersion: '0.0.1',
      runCodemods: true
    }).then(message => {
      expect(message).to.equal(
        'Would run the following codemods: testCodemod1, testCodemod2.'
      );
    });
  });
});
