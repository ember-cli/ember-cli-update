'use strict';

const expect = require('chai').expect;
const getCompareUrl = require('../../src/get-compare-url');

describe('Unit - getCompareUrl', function() {
  it('works', function() {
    expect(getCompareUrl({
      remoteUrl: 'test-url',
      startTag: 'v2.18.2',
      endTag: 'v3.0.2'
    })).to.equal('test-url/compare/v2.18.2...v3.0.2');
  });
});
