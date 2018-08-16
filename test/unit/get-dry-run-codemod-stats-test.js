'use strict';

const { expect } = require('chai');
const getDryRunCodemodStats = require('../../src/get-dry-run-codemod-stats');

describe('Unit - getDryRunCodemodStats', function() {
  it('works', function() {
    return getDryRunCodemodStats({
      testCodemod1: {},
      testCodemod2: {}
    }).then(message => {
      expect(message).to.equal(
        'Would run the following codemods: testCodemod1, testCodemod2.'
      );
    });
  });
});
