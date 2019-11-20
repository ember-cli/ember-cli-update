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
      blueprint
    });
  }

  describe('create', function() {
    it('saves blueprint', async function() {
      await saveBlueprint({
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            version: '0.0.1'
          }
        ]
      }));
    });

    it('saves with location', async function() {
      await saveBlueprint({
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        location: '/foo/bar',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            location: '/foo/bar',
            version: '0.0.1'
          }
        ]
      }));
    });

    it('saves with options', async function() {
      await saveBlueprint({
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        version: '0.0.1',
        options: ['test-option']
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            version: '0.0.1',
            options: ['test-option']
          }
        ]
      }));
    });

    describe('isBaseBlueprint', function() {
      it('saves true', async function() {
        await saveBlueprint({
          packageName: 'test-blueprint',
          name: 'test-blueprint',
          version: '0.0.1',
          isBaseBlueprint: true
        });

        expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
          blueprints: [
            {
              packageName: 'test-blueprint',
              name: 'test-blueprint',
              version: '0.0.1',
              isBaseBlueprint: true
            }
          ]
        }));
      });

      it('saves false', async function() {
        await saveBlueprint({
          packageName: 'test-blueprint',
          name: 'test-blueprint',
          version: '0.0.1',
          isBaseBlueprint: false
        });

        expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
          blueprints: [
            {
              packageName: 'test-blueprint',
              name: 'test-blueprint',
              version: '0.0.1',
              isBaseBlueprint: false
            }
          ]
        }));
      });

      it('ignores undefined', async function() {
        await saveBlueprint({
          packageName: 'test-blueprint',
          name: 'test-blueprint',
          version: '0.0.1'
        });

        expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
          blueprints: [
            {
              packageName: 'test-blueprint',
              name: 'test-blueprint',
              version: '0.0.1'
            }
          ]
        }));
      });
    });

    it('leaves other blueprints alone', async function() {
      loadSafeBlueprintFile.resolves({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint-2',
            version: '0.0.0'
          }
        ]
      });

      await saveBlueprint({
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint-2',
            version: '0.0.0'
          },
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            version: '0.0.1'
          }
        ]
      }));
    });

    it('leaves other packages alone', async function() {
      loadSafeBlueprintFile.resolves({
        blueprints: [
          {
            packageName: 'test-blueprint-2',
            name: 'test-blueprint',
            version: '0.0.0'
          }
        ]
      });

      await saveBlueprint({
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'test-blueprint-2',
            name: 'test-blueprint',
            version: '0.0.0'
          },
          {
            packageName: 'test-blueprint',
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
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            version: '0.0.0'
          }
        ]
      });

      await saveBlueprint({
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'test-blueprint',
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
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            location: '/foo/bar',
            version: '0.0.0'
          }
        ]
      });

      await saveBlueprint({
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            location: '/foo/bar',
            version: '0.0.1'
          }
        ]
      }));
    });

    it('saves with options', async function() {
      loadSafeBlueprintFile.resolves({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            version: '0.0.0',
            options: ['test-option']
          }
        ]
      });

      await saveBlueprint({
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            version: '0.0.1',
            options: ['test-option']
          }
        ]
      }));
    });

    describe('isBaseBlueprint', function() {
      it('saves true', async function() {
        loadSafeBlueprintFile.resolves({
          blueprints: [
            {
              packageName: 'test-blueprint',
              name: 'test-blueprint',
              version: '0.0.0',
              isBaseBlueprint: true
            }
          ]
        });

        await saveBlueprint({
          cwd,
          packageName: 'test-blueprint',
          name: 'test-blueprint',
          version: '0.0.1'
        });

        expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
          blueprints: [
            {
              packageName: 'test-blueprint',
              name: 'test-blueprint',
              version: '0.0.1',
              isBaseBlueprint: true
            }
          ]
        }));
      });

      it('saves false', async function() {
        loadSafeBlueprintFile.resolves({
          blueprints: [
            {
              packageName: 'test-blueprint',
              name: 'test-blueprint',
              version: '0.0.0',
              isBaseBlueprint: false
            }
          ]
        });

        await saveBlueprint({
          cwd,
          packageName: 'test-blueprint',
          name: 'test-blueprint',
          version: '0.0.1'
        });

        expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
          blueprints: [
            {
              packageName: 'test-blueprint',
              name: 'test-blueprint',
              version: '0.0.1',
              isBaseBlueprint: false
            }
          ]
        }));
      });

      it('ignores undefined', async function() {
        loadSafeBlueprintFile.resolves({
          blueprints: [
            {
              packageName: 'test-blueprint',
              name: 'test-blueprint',
              version: '0.0.0'
            }
          ]
        });

        await saveBlueprint({
          cwd,
          packageName: 'test-blueprint',
          name: 'test-blueprint',
          version: '0.0.1'
        });

        expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
          blueprints: [
            {
              packageName: 'test-blueprint',
              name: 'test-blueprint',
              version: '0.0.1'
            }
          ]
        }));
      });
    });

    it('leaves other blueprints alone', async function() {
      loadSafeBlueprintFile.resolves({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            version: '0.0.0'
          },
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint-2',
            version: '0.0.0'
          }
        ]
      });

      await saveBlueprint({
        cwd,
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            version: '0.0.1'
          },
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint-2',
            version: '0.0.0'
          }
        ]
      }));
    });

    it('leaves other packages alone', async function() {
      loadSafeBlueprintFile.resolves({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            version: '0.0.0'
          },
          {
            packageName: 'test-blueprint-2',
            name: 'test-blueprint',
            version: '0.0.0'
          }
        ]
      });

      await saveBlueprint({
        cwd,
        packageName: 'test-blueprint',
        name: 'test-blueprint',
        version: '0.0.1'
      });

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'test-blueprint',
            name: 'test-blueprint',
            version: '0.0.1'
          },
          {
            packageName: 'test-blueprint-2',
            name: 'test-blueprint',
            version: '0.0.0'
          }
        ]
      }));
    });
  });
});
