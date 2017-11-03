'use strict';

const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const _getProjectType = require('../../src/get-project-type');

function getProjectType(fixture) {
  return _getProjectType(JSON.parse(fs.readFileSync(path.join(fixture, 'package.json'), 'utf8')));
}

describe('Integration - getProjectType', function() {
  it('works', function() {
    expect(getProjectType('test/fixtures/type/app')).to.equal('app');
    expect(getProjectType('test/fixtures/type/addon')).to.equal('addon');
  });
});
