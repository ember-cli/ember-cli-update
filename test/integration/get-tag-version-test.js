'use strict';

const { expect } = require('chai');
const getTagVersion = require('../../src/get-tag-version');
const semver = require('semver');
const sinon = require('sinon');
const utils = require('../../src/utils');

describe('Integration - getTagVersion', function() {
  this.timeout(10 * 1000);

  let sandbox;
  let runSpy;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    runSpy = sandbox.spy(utils, 'run');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('allows version override', function() {
    expect(getTagVersion('2.13.1')).to.equal('2.13.1');
  });

  it('allows semver hints', function() {
    expect(getTagVersion(
      '~2.12',
      [
        '2.12.0',
        '2.12.1'
      ]
    )).to.equal('2.12.1');
  });

  it('works for ember app + beta', function() {
    expect(semver.valid(getTagVersion('beta', null, 'app'))).to.not.be.null;
    expect(runSpy.calledOnce).to.be.ok;
    expect(runSpy.args[0][0]).to.contain('ember-cli@beta');
  });

  it('works for ember addon + latest', function() {
    expect(semver.valid(getTagVersion('latest', null, 'addon'))).to.not.be.null;
    expect(runSpy.calledOnce).to.be.ok;
    expect(runSpy.args[0][0]).to.contain('ember-cli@latest');
  });

  it('works for glimmer app + beta', function() {
    expect(semver.valid(getTagVersion('beta', null, 'glimmer'))).to.not.be.null;
    expect(runSpy.calledOnce).to.be.ok;
    expect(runSpy.args[0][0]).to.contain('@glimmer/blueprint@beta');
  });
});
