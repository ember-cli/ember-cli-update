'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const { tmpdir } = require('os');
const { initBlueprint } = require('../helpers/blueprint');
const parseBlueprintPackage = require('../../src/parse-blueprint-package');
const downloadPackage = require('../../src/download-package');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const fs = require('fs-extra');

describe(downloadPackage, function() {
  this.timeout(30 * 1000);

  let tmpPath;

  beforeEach(async function() {
    tmpPath = path.join(await tmpDir(), 'app');
    await fs.mkdir(tmpPath);
  });

  it('throws if missing a range', async function() {
    await expect(downloadPackage('test-name', 'test-url', null))
      .to.eventually.be.rejectedWith('Missing a range when downloading blueprint');
  });

  it('downloads local paths as urls', async function() {
    let {
      name,
      location,
      version: range
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/merge/my-app')).blueprints[1];

    let blueprintPath = await initBlueprint({
      fixturesPath: 'test/fixtures/blueprint/app/local',
      resolvedFrom: tmpPath,
      relativeDir: location
    });

    let { url } = await parseBlueprintPackage({
      blueprint: blueprintPath
    });

    let downloadedPackage = await downloadPackage(null, url, range);

    expect(downloadedPackage.name).to.equal(name);
    expect(downloadedPackage.path).to.startWith(tmpdir()).and.endWith(path.join('node_modules', name));
    expect(downloadedPackage.version).to.equal(range);
  });

  it('downloads urls', async function() {
    let {
      name,
      location: url,
      version: range
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/remote-app/merge/my-app')).blueprints[0];

    let downloadedPackage = await downloadPackage(null, url, range);

    expect(downloadedPackage.name).to.equal(name);
    expect(downloadedPackage.path).to.startWith(tmpdir()).and.endWith(path.join('node_modules', name));
    expect(downloadedPackage.version).to.equal(range);
  });

  it('downloads npm packages', async function() {
    let {
      name,
      version: range
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/npm-app/merge/my-app')).blueprints[0];

    let downloadedPackage = await downloadPackage(name, null, range);

    expect(downloadedPackage.name).to.equal(name);
    expect(downloadedPackage.path).to.startWith(tmpdir()).and.endWith(path.join('node_modules', name));
    expect(downloadedPackage.version).to.equal(range);
  });
});
