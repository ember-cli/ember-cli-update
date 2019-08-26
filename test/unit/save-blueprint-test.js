'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const sinon = require('sinon');
const utils = require('../../src/utils');
const _saveBlueprint = require('../../src/save-blueprint');

const cwd = process.cwd();

describe(_saveBlueprint, function() {
  let sandbox;
  let loadSafeBlueprintFile;
  let saveBlueprintFile;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    loadSafeBlueprintFile = sandbox.stub(utils, 'loadSafeBlueprintFile')
      .withArgs(cwd).resolves({
        blueprints: []
      });
    saveBlueprintFile = sandbox.stub(utils, 'saveBlueprintFile').resolves();
  });

  afterEach(function() {
    expect(loadSafeBlueprintFile).to.be.calledOnce;
    expect(saveBlueprintFile).to.be.calledOnce;
    expect(saveBlueprintFile.args[0][0]).to.equal(cwd);

    sandbox.restore();
  });

  async function saveBlueprint(blueprint) {
    await _saveBlueprint({
      cwd,
      ...blueprint
    });
  }

  describe('create', function() {
    it('saves blueprint', async function() {
      await saveBlueprint({
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            name: 'test-blueprint',
            version: '0.0.1'
          }
        ]
      }));
    });

    it('saves with location', async function() {
      await saveBlueprint({
        name: 'test-blueprint',
        location: '/foo/bar',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            name: 'test-blueprint',
            location: '/foo/bar',
            version: '0.0.1'
          }
        ]
      }));
    });

    it('saves partial', async function() {
      await saveBlueprint({
        name: 'test-blueprint',
        version: '0.0.1',
        isPartial: true
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            name: 'test-blueprint',
            version: '0.0.1',
            isPartial: true
          }
        ]
      }));
    });

    it('leaves other blueprints alone', async function() {
      loadSafeBlueprintFile.resolves({
        blueprints: [
          {
            name: 'test-blueprint-2',
            version: '0.0.0'
          }
        ]
      });

      await saveBlueprint({
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            name: 'test-blueprint-2',
            version: '0.0.0'
          },
          {
            name: 'test-blueprint',
            version: '0.0.1'
          }
        ]
      }));
    });
  });

  describe('update', function() {
    it('saves blueprint', async function() {
      loadSafeBlueprintFile.resolves({
        blueprints: [
          {
            name: 'test-blueprint',
            version: '0.0.0'
          }
        ]
      });

      await saveBlueprint({
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            name: 'test-blueprint',
            version: '0.0.1'
          }
        ]
      }));
    });

    it('saves with location', async function() {
      loadSafeBlueprintFile.resolves({
        blueprints: [
          {
            name: 'test-blueprint',
            location: '/foo/bar',
            version: '0.0.0'
          }
        ]
      });

      await saveBlueprint({
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            name: 'test-blueprint',
            location: '/foo/bar',
            version: '0.0.1'
          }
        ]
      }));
    });

    it('saves partial', async function() {
      loadSafeBlueprintFile.resolves({
        blueprints: [
          {
            name: 'test-blueprint',
            version: '0.0.0',
            isPartial: true
          }
        ]
      });

      await saveBlueprint({
        cwd,
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            name: 'test-blueprint',
            version: '0.0.1',
            isPartial: true
          }
        ]
      }));
    });

    it('leaves other blueprints alone', async function() {
      loadSafeBlueprintFile.resolves({
        blueprints: [
          {
            name: 'test-blueprint',
            version: '0.0.0'
          },
          {
            name: 'test-blueprint-2',
            version: '0.0.0'
          }
        ]
      });

      await saveBlueprint({
        cwd,
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            name: 'test-blueprint',
            version: '0.0.1'
          },
          {
            name: 'test-blueprint-2',
            version: '0.0.0'
          }
        ]
      }));
    });
  });
});
