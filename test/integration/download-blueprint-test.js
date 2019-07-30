'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const { tmpdir } = require('os');
const { initBlueprint } = require('../helpers/blueprint');
const parseBlueprint = require('../../src/parse-blueprint');
const downloadBlueprint = require('../../src/download-blueprint');

describe(downloadBlueprint, function() {
  this.timeout(10 * 1000);

  it('downloads local paths as urls', async function() {
    let {
      name,
      location,
      version: range
    } = require('../fixtures/local-blueprint-app/local/my-app/ember-cli-update').blueprints[0];

    let blueprintPath = await initBlueprint('test/fixtures/local-blueprint', location);

    let { url } = await parseBlueprint(blueprintPath);

    let blueprint = await downloadBlueprint(null, url, range);

    expect(blueprint.name).to.equal(name);
    expect(blueprint.path).to.startWith(tmpdir()).and.endWith(path.join('node_modules', name));
    expect(require(path.join(blueprint.path, 'package')).version).to.equal(range);
  });

  it('downloads urls', async function() {
    let {
      name,
      location: url,
      version: range
    } = require('../fixtures/remote-blueprint-app/local/my-app/ember-cli-update').blueprints[0];

    let blueprint = await downloadBlueprint(null, url, range);

    expect(blueprint.name).to.equal(name);
    expect(blueprint.path).to.startWith(tmpdir()).and.endWith(path.join('node_modules', name));
    expect(require(path.join(blueprint.path, 'package')).version).to.equal(range);
  });

  it('downloads npm packages', async function() {
    let {
      name,
      version: range
    } = require('../fixtures/npm-blueprint-app/local/my-app/ember-cli-update').blueprints[0];

    let blueprint = await downloadBlueprint(name, null, range);

    expect(blueprint.name).to.equal(name);
    expect(blueprint.path).to.startWith(tmpdir()).and.endWith(path.join('node_modules', name));
    expect(require(path.join(blueprint.path, 'package')).version).to.equal(range);
  });
});
