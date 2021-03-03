'use strict';

const fs = require('fs');
const path = require('path');
const { createTmpDir } = require('../../src/tmp');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const hasYarn = require('../../src/has-yarn');

describe(hasYarn, function() {
  beforeEach(async function() {
    this.tempDir = await createTmpDir();
  });
  it('project with no yarn.lock returns false', async function() {
    let result = await hasYarn(this.tempDir);
    expect(result).to.be.false;
  });

  it('project with yarn.lock returns true', async function() {
    fs.writeFileSync(path.join(this.tempDir, 'yarn.lock'), '');
    let result = await hasYarn(this.tempDir);
    expect(result).to.be.true;
  });
});
