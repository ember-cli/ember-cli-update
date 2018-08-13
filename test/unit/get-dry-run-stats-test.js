'use strict';

const expect = require('chai').expect;
const getDryRunStats = require('../../src/get-dry-run-stats');

describe('Unit - getDryRunStats', function() {
  it('works', function() {
    return getDryRunStats({
      startVersion: '123',
      endVersion: '456'
    }).then(message => {
      expect(message).to.equal(
        'Would update from 123 to 456.'
      );
    });
  });
});
