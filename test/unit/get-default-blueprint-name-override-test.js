'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const getBlueprintNameOverride = require('../../src/get-default-blueprint-name-override');
const sinon = require('sinon');

const packageName = 'a-package-name';

describe(getBlueprintNameOverride, function() {
  afterEach(function() {
    sinon.restore();
  });

  it('returns default blueprint override name if it exists', async function() {
    sinon.stub(getBlueprintNameOverride, 'spawn').returns({
      stdout: JSON.stringify({
        name: packageName,
        'ember-addon': {
          defaultBlueprint: 'not-the-same-name'
        }
      }),
      exitCode: 0
    });

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageName);
    expect(defaultBlueprintOverride).to.equal('not-the-same-name');
  });

  it('Null if property does not exist in package.json', async function() {
    sinon.stub(getBlueprintNameOverride, 'spawn').returns({
      stdout: JSON.stringify({
        name: packageName
      }),
      exitCode: 0
    });

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageName);
    expect(defaultBlueprintOverride).to.be.null;
  });

  it('Error in spawn returns null', async function() {
    sinon.stub(getBlueprintNameOverride, 'spawn').returns({
      stdout: '',
      exitCode: 1
    });

    let defaultBlueprintOverride = await getBlueprintNameOverride(packageName);
    expect(defaultBlueprintOverride).to.be.null;
  });
});
