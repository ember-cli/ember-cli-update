'use strict';

const expect = require('chai').expect;
const getDryRunStats = require('../../src/get-dry-run-stats');

describe('Unit - getDryRunStats', function() {
  it('gives versions', function() {
    return getDryRunStats({
      startVersion: '123',
      endVersion: '456'
    }).then(message => {
      expect(message).to.equal(
        'Would update from 123 to 456.'
      );
    });
  });

  it('gives codemods', function() {
    return getDryRunStats({
      projectType: 'testProjectType',
      startVersion: '0.0.1',
      runCodemods: true,
      getCodemods() {
        return Promise.resolve({
          testCodemod1: {
            version: '0.0.1',
            projectTypes: ['testProjectType']
          },
          testCodemod2: {
            version: '0.0.1',
            projectTypes: ['testProjectType']
          },
          testCodemod3: {
            version: '0.0.2',
            projectTypes: ['testProjectType']
          }
        });
      }
    }).then(message => {
      expect(message).to.equal(
        'Would run the following codemods: testCodemod1, testCodemod2.'
      );
    });
  });
});
