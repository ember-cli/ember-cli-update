'use strict';

const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const _getPackageVersion = require('../../src/get-package-version');

function getPackageVersion(fixture) {
  return _getPackageVersion(JSON.parse(fs.readFileSync(path.join(fixture, 'package.json'), 'utf8')));
}

describe('Integration - getPackageVersion', function() {
  it('returns falsy for no devDependencies', function() {
    expect(getPackageVersion('test/fixtures/version/no-dev-deps')).to.be.not.ok;
  });

  it('returns falsy for no ember-cli', function() {
    expect(getPackageVersion('test/fixtures/version/no-ember-cli')).to.be.not.ok;
  });

  it('works with only ember-cli', function() {
    expect(getPackageVersion('test/fixtures/version/ember-cli')).to.equal('2.11');
  });
});
