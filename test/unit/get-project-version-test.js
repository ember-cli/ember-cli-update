'use strict';

const { expect } = require('chai');
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
    )).to.equal('2.11.1');
    expect(getProjectVersion(
      '2.12',
      [
        '2.12.0',
        '2.12.1'
      ]
    )).to.equal('2.12.0');
  });

  it('throws if glimmer and < 0.6.3', function() {
    expect(() => getProjectVersion(
      '0.3',
      [
        '0.3.1'
      ],
      'glimmer'
    )).to.throw('version cannot be determined');
  });

  it('doesn\'t throw if glimmer and >= 0.6.3', function() {
    expect(getProjectVersion(
      '0.6',
      [
        '0.6.3'
      ],
      'glimmer'
    )).to.equal('0.6.3');
  });
});
