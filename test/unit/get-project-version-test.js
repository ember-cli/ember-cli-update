'use strict';

const expect = require('chai').expect;
const getProjectVersion = require('../../src/get-project-version');

describe('Unit - getProjectVersion', function() {
  it('works', function() {
    expect(getProjectVersion(
      '2.11.1',
      [
        '2.11.0',
        '2.11.1',
        '2.11.2'
      ]
    )).to.equal('v2.11.1');
    expect(getProjectVersion(
      '2.12',
      [
        '2.12.0',
        '2.12.1'
      ]
    )).to.equal('v2.12.0');
  });
});
