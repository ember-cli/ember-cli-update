'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const sinon = require('sinon');
const utils = require('../../src/utils');
const _getTagVersion = require('../../src/get-tag-version');

describe(_getTagVersion, function() {
  let sandbox;
  let downloadBlueprintStub;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    downloadBlueprintStub = sandbox.stub(utils, 'downloadBlueprint');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('uses local semver', async function() {
    let version = '0.0.1';
    let range = '*';

    let getTagVersion = _getTagVersion([version], null, null);

    let _version = await getTagVersion(range);

    expect(_version).to.equal(version);

    expect(downloadBlueprintStub).to.not.be.called;
  });

  it('downloads blueprint', async function() {
    let {
      name,
      location,
      version
    } = require('../fixtures/local-blueprint-app/local/my-app/ember-cli-update').blueprints[0];
    let range = '*';

    let getTagVersion = _getTagVersion(null, name, location);

    let blueprint = { path: path.resolve(`test/fixtures/local-blueprint/v${version}`) };

    downloadBlueprintStub.withArgs(name, location, range).resolves(blueprint);

    let _version = await getTagVersion(range);

    expect(_version).to.equal(version);

    expect(downloadBlueprintStub).to.be.calledOnce;
  });
});
