'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const getBlueprintNameOverride = require('../../src/get-default-blueprint-name-override');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs-extra');
const npm = require('boilerplate-update/src/npm');

const cwd = 'a/made/up/path';
const packageNameOrPath = '../a-package-name';
const defaultBlueprint = 'not-the-same-name';
const localPackageJsonPath = path.join(path.resolve(cwd, packageNameOrPath), 'package.json');

describe(getBlueprintNameOverride, function() {
  let pathExistsStub;
  let readFileStub;
  let jsonStub;

  beforeEach(function() {
    pathExistsStub = sinon.stub(fs, 'pathExists');
    readFileStub = sinon.stub(fs, 'readFile');
    jsonStub = sinon.stub(npm, 'json');
  });

  afterEach(function() {
    sinon.restore();
  });

  it('returns default blueprint override name if it exists', async function() {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(true);

    readFileStub.withArgs(localPackageJsonPath).resolves(JSON.stringify({
      name: packageNameOrPath,
      'ember-addon': {
        defaultBlueprint
      }
    }));

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageNameOrPath, cwd);

    expect(defaultBlueprintOverride).to.equal(defaultBlueprint);
  });

  it('doesn\'t use npm if found locally', async function() {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(true);

    readFileStub.withArgs(localPackageJsonPath).resolves(JSON.stringify({
      name: packageNameOrPath,
      'ember-addon': {
        defaultBlueprint
      }
    }));

    await getBlueprintNameOverride(packageNameOrPath, cwd);

    expect(jsonStub).to.not.have.been.called;
  });

  it('uses npm if not found locally', async function() {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(false);

    jsonStub.withArgs('view', packageNameOrPath).resolves({
      name: packageNameOrPath,
      'ember-addon': {
        defaultBlueprint
      }
    });

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageNameOrPath, cwd);

    expect(defaultBlueprintOverride).to.equal(defaultBlueprint);
  });

  it('doesn\'t read local file if using npm', async function() {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(false);

    jsonStub.withArgs('view', packageNameOrPath).resolves({
      name: packageNameOrPath,
      'ember-addon': {
        defaultBlueprint
      }
    });

    await getBlueprintNameOverride(packageNameOrPath, cwd);

    expect(readFileStub).to.not.have.been.called;
  });

  it('Null if ember-addon does not exist in package.json', async function() {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(true);

    readFileStub.withArgs(localPackageJsonPath).resolves(JSON.stringify({
      name: packageNameOrPath
    }));

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageNameOrPath, cwd);

    expect(defaultBlueprintOverride).to.be.null;
  });

  it('Null if defaultBlueprint does not exist in ember-addon', async function() {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(true);

    readFileStub.withArgs(localPackageJsonPath).resolves(JSON.stringify({
      name: packageNameOrPath,
      'ember-addon': {}
    }));

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageNameOrPath, cwd);

    expect(defaultBlueprintOverride).to.be.null;
  });

  it('Error in spawn returns null', async function() {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(false);

    jsonStub.withArgs('view', packageNameOrPath).rejects();

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageNameOrPath, cwd);

    expect(defaultBlueprintOverride).to.be.null;
  });
});
