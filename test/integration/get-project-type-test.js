'use strict';

const expect = require('chai').expect;
const getProjectType = require('../../src/get-project-type');

describe('Integration - getProjectType', function() {
  it('works', function() {
    expect(getProjectType('test/fixtures/type/app')).to.equal('app');
    expect(getProjectType('test/fixtures/type/addon')).to.equal('addon');
  });
});
