'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const getBlueprintNameOverride = require('../../src/get-default-blueprint-name-override');
const sinon = require('sinon');
const npm = require('boilerplate-update/src/npm');

const packageName = 'a-package-name';

describe(getBlueprintNameOverride, function() {
  afterEach(function() {
    sinon.restore();
  });

  it('returns default blueprint override name if it exists', async function() {
    sinon.stub(npm, 'json').returns({
      name: packageName,
      'ember-addon': {
        defaultBlueprint: 'not-the-same-name'
      }
    });

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageName);
    expect(defaultBlueprintOverride).to.equal('not-the-same-name');
  });

  it('Null if property does not exist in package.json', async function() {
    sinon.stub(npm, 'json').returns({
      name: packageName
    });

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageName);
    expect(defaultBlueprintOverride).to.be.null;
  });

  it('Error in spawn returns null', async function() {
    sinon.stub(npm, 'json').throwsException();

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageName);
    expect(defaultBlueprintOverride).to.be.null;
  });

  it('Local package with nondefault returns expected value', async function() {
    let localPackageFixture = 'test/fixtures/blueprint/addon/default-blueprint-different-than-name/v0.0.1';
    let defaultBlueprintOverride = await getBlueprintNameOverride(localPackageFixture);
    expect(defaultBlueprintOverride).to.be.equal('custom-blueprint');
  });

  it('NPM package with nondefault returns expected value', async function() {
    let defaultBlueprintOverride = await getBlueprintNameOverride('ember-cli-update-default-blueprint-override-test');
    expect(defaultBlueprintOverride).to.be.equal('hello-world');
  });
});
