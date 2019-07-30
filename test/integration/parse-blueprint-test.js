'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const parseBlueprint = require('../../src/parse-blueprint');

const { toPosixAbsolutePath } = parseBlueprint;

describe(parseBlueprint, function() {
  it('detects local paths', async function() {
    let blueprint = 'test/fixtures/local-blueprint';

    let parsedBlueprint = await parseBlueprint(blueprint);

    expect(parsedBlueprint).to.deep.equal({
      name: undefined,
      url: `git+file://${toPosixAbsolutePath(path.join(process.cwd(), blueprint))}`
    });
  });

  it('detects urls', async function() {
    let blueprint = 'http://test-blueprint.com';

    let parsedBlueprint = await parseBlueprint(blueprint);

    expect(parsedBlueprint).to.deep.equal({
      name: undefined,
      url: blueprint
    });
  });

  it('detects npm packages', async function() {
    let blueprint = 'test-blueprint';

    let parsedBlueprint = await parseBlueprint(blueprint);

    expect(parsedBlueprint).to.deep.equal({
      name: 'test-blueprint',
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
