'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const getBlueprintFilePath = require('../../src/get-blueprint-file-path');
const path = require('path');

const { getBlueprintRelativeFilePath } = getBlueprintFilePath;

describe(getBlueprintFilePath, function () {
  it("doesn't have an ember-addon key", async function () {
    let dir = 'test/fixtures/package-json/no-ember-addon';
    let expected = 'config/ember-cli-update.json';

    let filePath = await getBlueprintFilePath(dir);

    expect(filePath).to.endWith(path.join(dir, expected));
  });

  it("doesn't have a custom config dir", async function () {
    let dir = 'test/fixtures/package-json/no-config-path';
    let expected = 'config/ember-cli-update.json';

    let filePath = await getBlueprintFilePath(dir);

    expect(filePath).to.endWith(path.join(dir, expected));
  });

  it('uses a custom config dir', async function () {
    let dir = 'test/fixtures/package-json/config-path';
    let expected = 'config2/ember-cli-update.json';

    let filePath = await getBlueprintFilePath(dir);

    expect(filePath).to.endWith(path.join(dir, expected));
  });

  describe(getBlueprintRelativeFilePath, function () {
    it("doesn't have an ember-addon key", async function () {
      let dir = 'test/fixtures/package-json/no-ember-addon';
      let expected = 'config/ember-cli-update.json';

      let filePath = await getBlueprintRelativeFilePath(dir);

      expect(filePath).to.equal(path.normalize(expected));
    });

    it("doesn't have a custom config dir", async function () {
      let dir = 'test/fixtures/package-json/no-config-path';
      let expected = 'config/ember-cli-update.json';

      let filePath = await getBlueprintRelativeFilePath(dir);

      expect(filePath).to.equal(path.normalize(expected));
    });

    it('uses a custom config dir', async function () {
      let dir = 'test/fixtures/package-json/config-path';
      let expected = 'config2/ember-cli-update.json';

      let filePath = await getBlueprintRelativeFilePath(dir);

      expect(filePath).to.equal(path.normalize(expected));
    });
  });
});
