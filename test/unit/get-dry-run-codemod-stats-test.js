'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const utils = require('../../src/utils');
const getDryRunCodemodStats = require('../../src/get-dry-run-codemod-stats');

describe('Unit - getDryRunCodemodStats', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('works', function() {
    let getApplicableCodemods = sandbox.stub(utils, 'getApplicableCodemods').resolves({
      testCodemod1: {},
      testCodemod2: {}
    });

    return getDryRunCodemodStats({
      projectType: 'testProjectType',
      startVersion: '0.0.1'
    }).then(message => {
      expect(getApplicableCodemods.args).to.deep.equal([[{
        projectType: 'testProjectType',
        startVersion: '0.0.1'
      }]]);

      expect(message).to.equal(
        'Would run the following codemods: testCodemod1, testCodemod2.'
      );
    });
  });
});
