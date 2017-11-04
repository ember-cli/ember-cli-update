'use strict';

const expect = require('chai').expect;
const getProjectType = require('../../src/get-project-type');

describe('Integration - getProjectType', function() {
  it('throws if no package.json', function() {
    expect(() => {
      getProjectType('test/fixtures/no-package-json');
    }).to.throw('No package.json was found in this directory');
  });

  it('throws if malformed package.json', function() {
    expect(() => {
      getProjectType('test/fixtures/malformed-package-json');
    }).to.throw('The package.json is malformed');
  });

  it('detects ember app', function() {
    expect(getProjectType('test/fixtures/type/app')).to.equal('app');
  });

  it('detects ember addon', function() {
    expect(getProjectType('test/fixtures/type/addon')).to.equal('addon');
  });
});
