'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const parseBlueprintPackage = require('../../src/parse-blueprint-package');

const { toPosixAbsolutePath } = parseBlueprintPackage;

describe(parseBlueprintPackage, function () {
  it('detects local paths', async function () {
    let packageName = '../fixtures/blueprint/app/local/v0.0.2';

    let parsedPackage = await parseBlueprintPackage({
      cwd: __dirname,
      packageName
    });

    expect(parsedPackage).to.deep.equal({
      name: undefined,
      location: packageName,
      url: `git+file://${toPosixAbsolutePath(path.join(__dirname, packageName))}`
    });
  });

  it('detects urls', async function () {
    let packageName = 'http://test-blueprint.com';

    let parsedPackage = await parseBlueprintPackage({
      packageName
    });

    expect(parsedPackage).to.deep.equal({
      name: undefined,
      location: packageName,
      url: packageName
    });
  });

  it('detects npm packages', async function () {
    let packageName = 'test-blueprint';

    let parsedPackage = await parseBlueprintPackage({
      packageName
    });

    expect(parsedPackage).to.deep.equal({
      name: packageName,
      location: undefined,
      url: undefined
    });
  });

  it('uses npm even if subdir match', async function () {
    let packageName = 'config';

    let cwd = path.resolve(
      __dirname,
      '../fixtures/blueprint/app/local-app/local/my-app'
    );

    expect(cwd).to.be.a.directory().and.include.subDirs([packageName]);

    let parsedPackage = await parseBlueprintPackage({
      cwd,
      packageName
    });

    expect(parsedPackage).to.deep.equal({
      name: packageName,
      location: undefined,
      url: undefined
    });
  });

  describe(toPosixAbsolutePath, function () {
    it('does Windows', function () {
      let before = 'C:\\foo\\bar';
      let expected = '/c/foo/bar';

      let actual = toPosixAbsolutePath(before);

      expect(actual).to.equal(expected);
    });

    it('does Unix', function () {
      let before = '/foo/bar';
      let expected = '/foo/bar';

      let actual = toPosixAbsolutePath(before);

      expect(actual).to.equal(expected);
    });
  });
});
