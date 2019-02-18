'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('chai');
const getProjectVersion = require('../../src/get-project-version');

describe(getProjectVersion, function() {
  it('throws if glimmer and < 0.6.3', function() {
    expect(() => getProjectVersion(
      '0.3',
      [
        '0.3.1'
      ],
      ['glimmer']
    )).to.throw('version cannot be determined');
  });

  it('doesn\'t throw if glimmer and >= 0.6.3', function() {
    expect(getProjectVersion(
      '0.6',
      [
        '0.6.3'
      ],
      ['glimmer']
    )).to.equal('0.6.3');
  });
});
