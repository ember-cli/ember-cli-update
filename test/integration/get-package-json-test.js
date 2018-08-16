'use strict';

const expect = require('chai').expect;
const getPackageJson = require('../../src/get-package-json');

describe('Integration - getPackageJson', function() {
  it('throws if no package.json', function() {
    expect(() => {
      getPackageJson('test/fixtures/package-json/missing');
    }).to.throw('No package.json was found in this directory');
  });

  it('throws if malformed package.json', function() {
    expect(() => {
      getPackageJson('test/fixtures/package-json/malformed');
    }).to.throw('The package.json is malformed');
  });

  it('loads package.json', function() {
    expect(getPackageJson('test/fixtures/package-json/valid')).to.deep.equal({});
  });
});
