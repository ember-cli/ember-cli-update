'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const parseBlueprintPackage = require('../../src/parse-blueprint-package');

const { toPosixAbsolutePath } = parseBlueprintPackage;

describe(parseBlueprintPackage, function() {
  it('detects local paths', async function() {
    let blueprint = 'test/fixtures/blueprint/app/local';

    let parsedPackage = await parseBlueprintPackage({
      cwd: process.cwd(),
      blueprint
    });

    expect(parsedPackage).to.deep.equal({
      name: undefined,
      location: blueprint,
      url: `git+file://${toPosixAbsolutePath(path.join(process.cwd(), blueprint))}`
    });
  });

  it('detects urls', async function() {
    let blueprint = 'http://test-blueprint.com';

    let parsedPackage = await parseBlueprintPackage({
      cwd: process.cwd(),
      blueprint
    });

    expect(parsedPackage).to.deep.equal({
      name: undefined,
      location: blueprint,
      url: blueprint
    });
  });

  it('detects npm packages', async function() {
    let blueprint = 'test-blueprint';

    let parsedPackage = await parseBlueprintPackage({
      cwd: process.cwd(),
      blueprint
    });

    expect(parsedPackage).to.deep.equal({
      name: 'test-blueprint',
      location: undefined,
      url: undefined
    });
  });

  describe(toPosixAbsolutePath, function() {
    it('does Windows', function() {
      let before = 'C:\\foo\\bar';
      let expected = '/c/foo/bar';

      let actual = toPosixAbsolutePath(before);

      expect(actual).to.equal(expected);
    });

    it('does Unix', function() {
      let before = '/foo/bar';
      let expected = '/foo/bar';

      let actual = toPosixAbsolutePath(before);

      expect(actual).to.equal(expected);
    });
  });
});
