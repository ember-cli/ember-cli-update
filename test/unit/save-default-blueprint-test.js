'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const sinon = require('sinon');
const utils = require('../../src/utils');
const saveDefaultBlueprint = require('../../src/save-default-blueprint');

describe(saveDefaultBlueprint, function() {
  let sandbox;
  let require;
  let getVersions;
  let saveBlueprint;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    require = sandbox.stub(utils, 'require');
    getVersions = sandbox.stub(utils, 'getVersions');
    saveBlueprint = sandbox.stub(utils, 'saveBlueprint');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('saves blueprint', async function() {
    require = require.withArgs(path.normalize('/test/path/package')).returns({
      devDependencies: {
        'ember-cli': '0.0.1'
      }
    });

    getVersions = getVersions.withArgs('ember-cli').resolves(['0.0.1']);

    saveBlueprint = saveBlueprint.withArgs({
      cwd: '/test/path',
      name: 'ember-cli',
      version: '0.0.1'
    }).resolves();

    await saveDefaultBlueprint({
      cwd: '/test/path',
      blueprint: { name: 'ember-cli' }
    });

    expect(require).to.be.calledOnce;
    expect(getVersions).to.be.calledOnce;
    expect(saveBlueprint).to.be.calledOnce;
  });
});
