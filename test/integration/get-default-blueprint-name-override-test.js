'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const getBlueprintNameOverride = require('../../src/get-default-blueprint-name-override');

describe(getBlueprintNameOverride, function () {
  it('local package with non-default returns expected value', async function () {
    let localPackageFixture =
      '../fixtures/blueprint/addon/default-blueprint-different-than-name/v0.0.1';

    let defaultBlueprintOverride = await getBlueprintNameOverride(
      localPackageFixture,
      __dirname
    );

    expect(defaultBlueprintOverride).to.be.equal('custom-blueprint');
  });

  it('NPM package with non-default returns expected value', async function () {
    let defaultBlueprintOverride = await getBlueprintNameOverride(
      'ember-cli-update-default-blueprint-override-test'
    );

    expect(defaultBlueprintOverride).to.be.equal('hello-world');
  });

  it('missing NPM package returns null', async function () {
    let defaultBlueprintOverride = await getBlueprintNameOverride(
      'this-is-hopefully-missing'
    );

    expect(defaultBlueprintOverride).to.be.null;
  });
});
