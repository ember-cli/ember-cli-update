'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const isDefaultBlueprint = require('../../src/is-default-blueprint');
const {
  defaultPackageName,
  defaultAppBlueprintName,
  defaultAddonBlueprintName,
  glimmerPackageName
} = require('../../src/constants');

describe(isDefaultBlueprint, function() {
  it('detects default app blueprint', function() {
    expect(isDefaultBlueprint({
      packageName: defaultPackageName,
      name: defaultAppBlueprintName
    })).to.be.true;
  });

  it('detects default addon blueprint', function() {
    expect(isDefaultBlueprint({
      packageName: defaultPackageName,
      name: defaultAddonBlueprintName
    })).to.be.true;
  });

  it('detects glimmer blueprint', function() {
    expect(isDefaultBlueprint({
      packageName: glimmerPackageName,
      name: glimmerPackageName
    })).to.be.true;
  });

  it('detects custom blueprint', function() {
    expect(isDefaultBlueprint({
      packageName: defaultPackageName,
      name: 'custom-blueprint'
    })).to.be.false;
  });
});
