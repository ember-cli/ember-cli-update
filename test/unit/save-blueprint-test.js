'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const sinon = require('sinon');
const utils = require('../../src/utils');
const _saveBlueprint = require('../../src/save-blueprint');

const cwd = process.cwd();

describe(_saveBlueprint, function() {
  let loadDefaultBlueprintFromDisk;
  let loadSafeBlueprintFile;
  let saveBlueprintFile;

  beforeEach(function() {
    loadDefaultBlueprintFromDisk = sinon.stub(utils, 'loadDefaultBlueprintFromDisk')
      .withArgs(cwd).resolves({
        packageName: 'ember-cli',
        name: 'ember-cli',
        version: '0.0.1',
        options: []
      });
    loadSafeBlueprintFile = sinon.stub(utils, 'loadSafeBlueprintFile')
      .withArgs(cwd).resolves({
        blueprints: []
      });
    saveBlueprintFile = sinon.stub(utils, 'saveBlueprintFile').resolves();
  });

  afterEach(function() {
    expect(loadDefaultBlueprintFromDisk).to.not.be.called;
    expect(loadSafeBlueprintFile).to.be.calledOnce;
    expect(saveBlueprintFile).to.be.calledOnce;
    expect(saveBlueprintFile.args[0][0]).to.equal(cwd);

    sinon.restore();
  });

  async function saveBlueprint(blueprint) {
    await _saveBlueprint({
      cwd,
      blueprint
    });
  }

  describe('default', function() {
    it('saves default blueprint when missing', async function() {
      await saveBlueprint();

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'ember-cli',
            name: 'ember-cli',
            version: '0.0.1'
          }
        ]
      }));

      expect(loadDefaultBlueprintFromDisk).to.be.calledOnce;

      loadDefaultBlueprintFromDisk.resetHistory();
    });

    it('saves default blueprint when missing version', async function() {
      await saveBlueprint({});

      expect(JSON.stringify(saveBlueprintFile.args[0][1])).to.equal(JSON.stringify({
        blueprints: [
          {
            packageName: 'ember-cli',
            name: 'ember-cli',
            version: '0.0.1'
          }
        ]
      }));

      expect(loadDefaultBlueprintFromDisk).to.be.calledOnce;

      loadDefaultBlueprintFromDisk.resetHistory();
    });
  });

  describe('custom', function() {
    describe('create', function() {
      it('saves blueprint', async function() {
        await saveBlueprint({
          packageName: 'test-blueprint',
          name: 'test-blueprint',
          version: '0.0.1',
          options: []
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
          version: '0.0.1',
          options: []
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
            isBaseBlueprint: true,
            options: []
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
            isBaseBlueprint: false,
            options: []
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
            version: '0.0.1',
            options: []
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
          version: '0.0.1',
          options: []
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
          version: '0.0.1',
          options: []
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
});
