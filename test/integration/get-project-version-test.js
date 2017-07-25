'use strict';

const expect = require('chai').expect;
const getProjectVersion = require('../../src/get-project-version');

describe('Integration - getProjectVersion', function() {
  this.timeout(10000);

  it('works', function() {
    expect(getProjectVersion('2.11.1')).to.equal('v2.11.1');
    expect(getProjectVersion('2.12')).to.equal('v2.12.3');
  });
});
