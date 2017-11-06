'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const getVersions = require('../../src/get-versions');
const utils = require('../../src/utils');

describe('Unit - getVersions', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  function createStub(versionsString) {
    let run = utils.run;
    return sandbox.stub(utils, 'run').callsFake(function(command) {
      if (command.indexOf('npm info') > -1) {
        return versionsString;
      }

      return run.apply(this, arguments);
    });
  }

  it('gets versions for ember app', function() {
    let versionsString = '["1"]';

    let runStub = createStub(versionsString);

    let versions = getVersions('app');

    expect(versions).to.deep.equal(['1']);

    expect(runStub.calledOnce).to.be.ok;
    expect(runStub.args[0][0]).to.contain('ember-cli');
  });

  it('gets versions for ember addon', function() {
    let versionsString = '["2"]';

    let runStub = createStub(versionsString);

    let versions = getVersions('addon');

    expect(versions).to.deep.equal(['2']);

    expect(runStub.calledOnce).to.be.ok;
    expect(runStub.args[0][0]).to.contain('ember-cli');
  });
});
