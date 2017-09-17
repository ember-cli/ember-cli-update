'use strict';

const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const fixturify = require('fixturify');
const autoMergePackageJson = require('../../src/auto-merge-package-json');

const fixturesPath = 'test/fixtures/package.json';

describe('Unit - autoMergePackageJson', function() {
  function forEachDir(callback) {
    fs.readdirSync(fixturesPath).forEach(fixtureDir => {
      let it = global.it;
      if (fixtureDir.indexOf('_') === 0) {
        it = it.only;
      }
      callback(it, fixtureDir);
    });
  }

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
