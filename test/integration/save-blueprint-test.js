'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);
const saveBlueprint = require('../../src/save-blueprint');

describe(saveBlueprint, function() {
  let tmpPath;

  beforeEach(async function() {
    tmpPath = await tmpDir();
  });

  describe('create', function() {
    it('saves blueprint', async function() {
      await saveBlueprint({
        cwd: tmpPath,
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(path.join(tmpPath, 'ember-cli-update.json')).to.be.a.file()
        .and.equal('test/fixtures/ember-cli-update-json/normal/ember-cli-update.json');
    });

    it('saves with location', async function() {
      await saveBlueprint({
        cwd: tmpPath,
        name: 'test-blueprint',
        location: '/foo/bar',
        version: '0.0.1'
      });

      expect(path.join(tmpPath, 'ember-cli-update.json')).to.be.a.file()
        .and.equal('test/fixtures/ember-cli-update-json/location/ember-cli-update.json');
    });

    it('saves partial', async function() {
      await saveBlueprint({
        cwd: tmpPath,
        name: 'test-blueprint',
        version: '0.0.1',
        isPartial: true
      });

      expect(path.join(tmpPath, 'ember-cli-update.json')).to.be.a.file()
        .and.equal('test/fixtures/ember-cli-update-json/partial/ember-cli-update.json');
    });
  });

  describe('update', function() {
    it('saves blueprint', async function() {
      await saveBlueprint({
        cwd: tmpPath,
        name: 'test-blueprint',
        version: '0.0.0'
      });

      await saveBlueprint({
        cwd: tmpPath,
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(path.join(tmpPath, 'ember-cli-update.json')).to.be.a.file()
        .and.equal('test/fixtures/ember-cli-update-json/normal/ember-cli-update.json');
    });

    it('saves with location', async function() {
      await saveBlueprint({
        cwd: tmpPath,
        name: 'test-blueprint',
        location: '/foo/bar',
        version: '0.0.0'
      });

      await saveBlueprint({
        cwd: tmpPath,
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(path.join(tmpPath, 'ember-cli-update.json')).to.be.a.file()
        .and.equal('test/fixtures/ember-cli-update-json/location/ember-cli-update.json');
    });

    it('saves partial', async function() {
      await saveBlueprint({
        cwd: tmpPath,
        name: 'test-blueprint',
        version: '0.0.0',
        isPartial: true
      });

      await saveBlueprint({
        cwd: tmpPath,
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(path.join(tmpPath, 'ember-cli-update.json')).to.be.a.file()
        .and.equal('test/fixtures/ember-cli-update-json/partial/ember-cli-update.json');
    });
  });
});
