'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const getBlueprintFilePath = require('../../src/get-blueprint-file-path');
const path = require('path');

describe(getBlueprintFilePath, function() {
  it('finds a standard config dir', async function() {
    let dir = 'test/fixtures/blueprint/app/local-app/local/my-app';

    let filePath = await getBlueprintFilePath(dir);

    expect(path.dirname(filePath)).to.have.basename('config');
    expect(filePath).to.be.a.path();
  });

  it('finds a custom config dir', async function() {
    let dir = 'test/fixtures/blueprint/app/legacy-app/local/my-app';

    let filePath = await getBlueprintFilePath(dir);

    expect(path.dirname(filePath)).to.not.have.basename('config');
    expect(filePath).to.be.a.path();
  });

  it('falls back if no state file', async function() {
    let dir = 'test/fixtures/blueprint/addon/legacy-app/local/no-state-file/my-app';

    let filePath = await getBlueprintFilePath(dir);

    expect(path.dirname(filePath)).to.have.basename('config');
    expect(filePath).to.not.be.a.path();
  });
});
