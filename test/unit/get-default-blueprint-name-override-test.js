'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const getBlueprintNameOverride = require('../../src/get-default-blueprint-name-override');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs-extra');
const pacote = require('pacote');

const cwd = 'a/made/up/path';
const packageNameOrPath = '../a-package-name';
const defaultBlueprint = 'not-the-same-name';
const localPackageJsonPath = path.join(
  path.resolve(cwd, packageNameOrPath),
  'package.json'
);

describe(getBlueprintNameOverride, function () {
  let pathExistsStub;
  let readFileStub;
  let manifestStub;

  beforeEach(function () {
    pathExistsStub = sinon.stub(fs, 'pathExists');
    readFileStub = sinon.stub(fs, 'readFile');
    manifestStub = sinon.stub(pacote, 'manifest');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('returns default blueprint override name if it exists', async function () {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(true);

    readFileStub.withArgs(localPackageJsonPath).resolves(
      JSON.stringify({
        name: packageNameOrPath,
        'ember-addon': {
          defaultBlueprint
        }
      })
    );

    let defaultBlueprintOverride = await getBlueprintNameOverride(
      packageNameOrPath,
      cwd
    );

    expect(defaultBlueprintOverride).to.equal(defaultBlueprint);
  });

  it("doesn't use NPM if found locally", async function () {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(true);

    readFileStub.withArgs(localPackageJsonPath).resolves(
      JSON.stringify({
        name: packageNameOrPath,
        'ember-addon': {
          defaultBlueprint
        }
      })
    );

    await getBlueprintNameOverride(packageNameOrPath, cwd);

    expect(manifestStub).to.not.have.been.called;
  });

  it('uses NPM if not found locally', async function () {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(false);

    manifestStub.withArgs(packageNameOrPath).resolves({
      name: packageNameOrPath,
      'ember-addon': {
        defaultBlueprint
      }
    });

    let defaultBlueprintOverride = await getBlueprintNameOverride(
      packageNameOrPath,
      cwd
    );

    expect(defaultBlueprintOverride).to.equal(defaultBlueprint);
  });

  it("doesn't read local file if using NPM", async function () {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(false);

    manifestStub.withArgs(packageNameOrPath).resolves({
      name: packageNameOrPath,
      'ember-addon': {
        defaultBlueprint
      }
    });

    await getBlueprintNameOverride(packageNameOrPath, cwd);

    expect(readFileStub).to.not.have.been.called;
  });

  it('null if ember-addon does not exist in package.json', async function () {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(true);

    readFileStub.withArgs(localPackageJsonPath).resolves(
      JSON.stringify({
        name: packageNameOrPath
      })
    );

    let defaultBlueprintOverride = await getBlueprintNameOverride(
      packageNameOrPath,
      cwd
    );

    expect(defaultBlueprintOverride).to.be.null;
  });

  it('null if defaultBlueprint does not exist in ember-addon', async function () {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(true);

    readFileStub.withArgs(localPackageJsonPath).resolves(
      JSON.stringify({
        name: packageNameOrPath,
        'ember-addon': {}
      })
    );

    let defaultBlueprintOverride = await getBlueprintNameOverride(
      packageNameOrPath,
      cwd
    );

    expect(defaultBlueprintOverride).to.be.null;
  });

  it('missing NPM package returns null', async function () {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(false);

    manifestStub.withArgs(packageNameOrPath).rejects({
      statusCode: 404
    });

    let defaultBlueprintOverride = await getBlueprintNameOverride(
      packageNameOrPath,
      cwd
    );

    expect(defaultBlueprintOverride).to.be.null;
  });

  it("doesn't swallow all NPM errors", async function () {
    pathExistsStub.withArgs(localPackageJsonPath).resolves(false);

    let err = {
      statusCode: 123
    };

    manifestStub.withArgs(packageNameOrPath).rejects({
      statusCode: 123
    });

    let promise = getBlueprintNameOverride(packageNameOrPath, cwd);

    await expect(promise).to.eventually.be.rejectedWith(err);
  });
});
