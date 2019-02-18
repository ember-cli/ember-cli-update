'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const co = require('co');
const getVersions = require('../../src/get-versions');
const utils = require('../../src/utils');

describe(getVersions, function() {
  let sandbox;
  let getVersionsStub;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    getVersionsStub = sandbox.stub(utils, 'getVersions');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('gets versions for ember app', co.wrap(function*() {
    getVersionsStub.withArgs('ember-cli').resolves(['1']);

    let versions = yield getVersions('app');

    expect(versions).to.deep.equal(['1']);

    expect(getVersionsStub.calledOnce).to.be.ok;
  }));

  it('gets versions for ember addon', co.wrap(function*() {
    getVersionsStub.withArgs('ember-cli').resolves(['2']);

    let versions = yield getVersions('addon');

    expect(versions).to.deep.equal(['2']);

    expect(getVersionsStub.calledOnce).to.be.ok;
  }));

  it('gets versions for glimmer app', co.wrap(function*() {
    getVersionsStub.withArgs('@glimmer/blueprint').resolves(['3']);

    let versions = yield getVersions('glimmer');

    expect(versions).to.deep.equal(['3']);

    expect(getVersionsStub.calledOnce).to.be.ok;
  }));
});
