'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const compareVersions = require('../../src/compare-versions');
const utils = require('../../src/utils');

describe('Unit - compareVersions', function() {
  let sandbox;
  let opn;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    opn = sandbox.stub(utils, 'opn');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('works', function() {
    return compareVersions({
      remoteUrl: 'test-url',
      startTag: 'v2.18.2',
      endTag: 'v3.0.2'
    }).then(() => {
      expect(opn.calledOnce).to.be.ok;
      expect(opn.args[0][0]).to.equal('test-url/compare/v2.18.2...v3.0.2');
    });
  });
});
