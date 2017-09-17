'use strict';

const expect = require('chai').expect;
const path = require('path');
const fixturify = require('fixturify');
const fixtureSkipper = require('fixture-skipper');
const autoMergePackageJson = require('../../src/auto-merge-package-json');

const fixturesPath = 'test/fixtures/package.json';

const forEachDir = fixtureSkipper(fixturesPath);

describe('Unit - autoMergePackageJson', function() {
  forEachDir((it, fixturesDir) => {
    it(fixturesDir, function() {
      let fixtures = fixturify.readSync(path.join(fixturesPath, fixturesDir));
      let from = fixtures.from['package.json'];
      let my = fixtures.my['package.json'];
      let result = fixtures.result['package.json'];
      let to = fixtures.to['package.json'];

      let actual = autoMergePackageJson(my, from, to);

      expect(actual).to.equal(result);
    });
  });
});
