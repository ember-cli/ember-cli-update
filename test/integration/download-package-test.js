'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const { tmpdir } = require('os');
const { initBlueprint } = require('../helpers/blueprint');
const parseBlueprint = require('../../src/parse-blueprint');
const downloadPackage = require('../../src/download-package');

describe(downloadPackage, function() {
  this.timeout(30 * 1000);

  it('throws if missing a range', async function() {
    await expect(downloadPackage('test-name', 'test-url', null))
      .to.eventually.be.rejectedWith('Missing a range when downloading blueprint');
  });

  it('downloads local paths as urls', async function() {
    let {
      name,
      location,
      version: range
    } = require('../fixtures/blueprint/app/local-app/merge/my-app/config/ember-cli-update').blueprints[1];

    let blueprintPath = await initBlueprint('test/fixtures/blueprint/app/local', location);

    let { url } = await parseBlueprint(blueprintPath);

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
    } = require('../fixtures/blueprint/app/remote-app/merge/my-app/config/ember-cli-update').blueprints[0];

    let downloadedPackage = await downloadPackage(null, url, range);

    expect(downloadedPackage.name).to.equal(name);
    expect(downloadedPackage.path).to.startWith(tmpdir()).and.endWith(path.join('node_modules', name));
    expect(downloadedPackage.version).to.equal(range);
  });

  it('downloads npm packages', async function() {
    let {
      name,
      version: range
    } = require('../fixtures/blueprint/app/npm-app/merge/my-app/config/ember-cli-update').blueprints[0];

    let downloadedPackage = await downloadPackage(name, null, range);

    expect(downloadedPackage.name).to.equal(name);
    expect(downloadedPackage.path).to.startWith(tmpdir()).and.endWith(path.join('node_modules', name));
    expect(downloadedPackage.version).to.equal(range);
  });
});
