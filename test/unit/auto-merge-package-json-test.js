'use strict';

const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const autoMergePackageJson = require('../../src/auto-merge-package-json');

const fixturesPath = 'test/fixtures/package.json';

function getFixtures(fixturesDir) {
  let fixtures = path.join(fixturesPath, fixturesDir);
  return fs.readdirSync(fixtures).reduce((result, name) => {
    result[name] = fs.readFileSync(path.join(fixtures, name, 'package.json'), 'utf8');
    return result;
  }, {});
}

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
      let fixtures = getFixtures(fixturesDir);
      let from = fixtures.from;
      let my = fixtures.my;
      let result = fixtures.result;
      let to = fixtures.to;

      let actual = autoMergePackageJson(my, from, to);

      expect(actual).to.equal(result);
    });
  });
});
