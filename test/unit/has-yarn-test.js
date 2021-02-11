'use strict';

const os = require('os');
const fixturify = require('fixturify');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const hashYarn = require('../../src/has-yarn');

describe(hashYarn, function() {
  beforeEach(function() {
    this.tempDir = os.tmpdir();
  });
  it('project with no yarn.lock returns false', function() {
    let result = hashYarn(this.tempDir);
    expect(result).to.be.false;
  });

  it('project with yarn.lock returns true', function() {
    fixturify.writeSync(this.tempDir, {
      'yarn.lock': ''
    });
    let result = hashYarn(this.tempDir);
    expect(result).to.be.true;
  });
});
