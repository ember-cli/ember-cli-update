'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const sinon = require('sinon');
const path = require('path');
const _getStartAndEndCommands = require('../../src/get-start-and-end-commands');
const utils = require('../../src/utils');
const loadSafeBlueprint = require('../../src/load-safe-blueprint');
const loadDefaultBlueprint = require('../../src/load-default-blueprint');

const {
  getArgs: _getArgs
} = _getStartAndEndCommands;

const projectName = 'my-custom-project';
const startVersion = '0.0.1';
const endVersion = '0.0.2';
const baseVersion = '0.0.3';
const packageRoot = '/test/package/root';
const packageVersion = startVersion;
const cwd = '/test/cwd';
const packageName = 'ember-cli';
const commandName = 'ember';
const blueprint = 'test-blueprint';
const blueprintPath = '/path/to/blueprint';
const projectRoot = path.join(cwd, projectName);
const baseBlueprint = loadDefaultBlueprint([], baseVersion);
const defaultStartBlueprint = loadDefaultBlueprint([], startVersion);
const defaultEndBlueprint = loadDefaultBlueprint([], endVersion);

describe(_getStartAndEndCommands, function() {
  let npxStub;
  let spawnStub;
  let readdirStub;
  let overwriteBlueprintFilesStub;
  let installAddonBlueprintStub;
  let appendNodeModulesIgnoreStub;

  beforeEach(function() {
    npxStub = sinon.stub(_getStartAndEndCommands, 'npx').returns('test npx');
    spawnStub = sinon.stub(_getStartAndEndCommands, 'spawn').returns('test spawn');
    readdirStub = sinon.stub(utils, 'readdir').resolves(['foo']);
    overwriteBlueprintFilesStub = sinon.stub(_getStartAndEndCommands, 'overwriteBlueprintFiles');
    installAddonBlueprintStub = sinon.stub(_getStartAndEndCommands, 'installAddonBlueprint').resolves();
    appendNodeModulesIgnoreStub = sinon.stub(_getStartAndEndCommands, 'appendNodeModulesIgnore').resolves();
  });

  afterEach(function() {
    sinon.restore();
  });

  function getStartAndEndCommands(options) {
    return _getStartAndEndCommands(Object.assign({
      packageJson: { name: projectName },
      startBlueprint: defaultStartBlueprint,
      endBlueprint: defaultEndBlueprint
    }, options));
  }

  it('throws if base blueprint is not marked as such', function() {
    let f = () => getStartAndEndCommands({
      baseBlueprint: {}
    });

    expect(f).to.throw('The intended base blueprint is not actually a base blueprint.');
  });

  it('throws if two layers of base blueprints', function() {
    let f = () => getStartAndEndCommands({
      baseBlueprint
    });

    expect(f).to.throw('You supplied two layers of base blueprints.');
  });

  it('returns an options object', function() {
    let options = getStartAndEndCommands();

    expect(options.createProjectFromCache).to.be.a('function');
    expect(options.createProjectFromRemote).to.be.a('function');

    delete options.createProjectFromCache;
    delete options.createProjectFromRemote;

    expect(options).to.deep.equal({
      projectName,
      packageName,
      commandName,
      startOptions: {
        baseBlueprint: undefined,
        blueprint: defaultStartBlueprint,
        packageRange: startVersion
      },
      endOptions: {
        baseBlueprint: undefined,
        blueprint: defaultEndBlueprint,
        packageRange: endVersion
      }
    });
  });

  it('can create a base project from cache', async function() {
    let { createProjectFromCache } = getStartAndEndCommands();

    let createProject = createProjectFromCache({
      packageRoot,
      options: {
        projectName,
        blueprint: loadDefaultBlueprint(['welcome'])
      }
    });

    sinon.stub(utils, 'require')
      .withArgs(path.join(blueprintPath, 'package'))
      .returns({ keywords: ['ember-blueprint'] });

    expect(await createProject(cwd)).to.equal(projectRoot);

    expect(spawnStub.args).to.deep.equal([[
      'node',
      [
        path.normalize(`${packageRoot}/bin/ember`),
        'new',
        projectName,
        '-sg',
        '-sn',
        '-sb',
        '-b',
        'app'
      ],
      {
        cwd
      }
    ]]);

    expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test spawn']]);
  });

  it('can create a partial project from cache', async function() {
    let { createProjectFromCache } = getStartAndEndCommands();

    let createProject = createProjectFromCache({
      packageRoot,
      options: {
        baseBlueprint,
        projectName,
        blueprint: loadSafeBlueprint({
          path: blueprintPath
        })
      }
    });

    sinon.stub(utils, 'require')
      .withArgs(path.join(blueprintPath, 'package'))
      .returns({ keywords: ['ember-blueprint'] });

    expect(await createProject(cwd)).to.equal(projectRoot);

    expect(spawnStub.args).to.deep.equal([
      [
        'node',
        [
          path.normalize(`${packageRoot}/bin/ember`),
          'new',
          projectName,
          '-sg',
          '-sn',
          '-sb',
          '-b',
          baseBlueprint.name,
          ...baseBlueprint.options
        ],
        {
          cwd
        }
      ],
      [
        'node',
        [
          path.normalize(`${packageRoot}/bin/ember`),
          'init',
          '-sn',
          '-sb',
          '-b',
          blueprintPath
        ],
        {
          cwd: projectRoot
        }
      ]
    ]);

    expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test spawn'], ['test spawn']]);
  });

  it('can create a base project from remote', async function() {
    let { createProjectFromRemote } = getStartAndEndCommands();

    let createProject = createProjectFromRemote({
      options: {
        projectName,
        blueprint: loadDefaultBlueprint(['welcome'], packageVersion)
      }
    });

    expect(await createProject(cwd)).to.equal(projectRoot);

    expect(npxStub.args).to.deep.equal([[
      [
        '-p',
        `${packageName}@${packageVersion}`,
        commandName,
        'new',
        projectName,
        '-sg',
        '-sn',
        '-sb',
        '-b',
        'app'
      ],
      {
        cwd
      }
    ]]);

    expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test npx']]);
  });

  it('can create a partial project from remote', async function() {
    let { createProjectFromRemote } = getStartAndEndCommands();

    let createProject = createProjectFromRemote({
      options: {
        baseBlueprint,
        projectName,
        blueprint: loadSafeBlueprint({
          path: blueprintPath
        })
      }
    });

    sinon.stub(utils, 'require')
      .withArgs(path.join(blueprintPath, 'package'))
      .returns({ keywords: ['ember-blueprint'] });

    expect(await createProject(cwd)).to.equal(projectRoot);

    expect(npxStub.args).to.deep.equal([
      [
        [
          '-p',
          `${baseBlueprint.packageName}@${baseBlueprint.version}`,
          commandName,
          'new',
          projectName,
          '-sg',
          '-sn',
          '-sb',
          '-b',
          baseBlueprint.name,
          ...baseBlueprint.options
        ],
        {
          cwd
        }
      ],
      [
        [
          packageName,
          'init',
          '-sn',
          '-sb',
          '-b',
          blueprintPath
        ],
        {
          cwd: projectRoot
        }
      ]
    ]);

    expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test npx'], ['test npx']]);
  });

  it('can create a project without a blueprint', async function() {
    let { createProjectFromRemote } = getStartAndEndCommands();

    let createProject = createProjectFromRemote({
      options: {
        baseBlueprint,
        projectName
      }
    });

    sinon.stub(utils, 'require')
      .withArgs(path.join(blueprintPath, 'package'))
      .returns({ keywords: ['ember-blueprint'] });

    expect(await createProject(cwd)).to.equal(projectRoot);

    expect(npxStub.args).to.deep.equal([[
      [
        '-p',
        `${baseBlueprint.packageName}@${baseBlueprint.version}`,
        commandName,
        'new',
        projectName,
        '-sg',
        '-sn',
        '-sb',
        '-b',
        baseBlueprint.name,
        ...baseBlueprint.options
      ],
      {
        cwd
      }
    ]]);

    expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test npx']]);
  });

  describe('custom blueprint', function() {
    it('returns an options object - base default', async function() {
      let options = getStartAndEndCommands({
        baseBlueprint,
        startBlueprint: {
          name: blueprint,
          version: startVersion
        },
        endBlueprint: {
          name: blueprint,
          version: endVersion
        }
      });

      expect(options.createProjectFromCache).to.be.a('function');
      expect(options.createProjectFromRemote).to.be.a('function');

      delete options.createProjectFromCache;
      delete options.createProjectFromRemote;

      expect(options).to.deep.equal({
        projectName,
        packageName,
        commandName,
        startOptions: {
          baseBlueprint,
          blueprint: {
            name: blueprint,
            version: startVersion
          },
          packageRange: baseVersion
        },
        endOptions: {
          baseBlueprint,
          blueprint: {
            name: blueprint,
            version: endVersion
          },
          packageRange: baseVersion
        }
      });
    });

    it('returns an options object - base custom', async function() {
      let options = getStartAndEndCommands({
        baseBlueprint: {
          version: baseVersion,
          isBaseBlueprint: true
        },
        startBlueprint: {
          name: blueprint,
          version: startVersion
        },
        endBlueprint: {
          name: blueprint,
          version: endVersion
        }
      });

      expect(options.createProjectFromCache).to.be.a('function');
      expect(options.createProjectFromRemote).to.be.a('function');

      delete options.createProjectFromCache;
      delete options.createProjectFromRemote;

      expect(options).to.deep.equal({
        projectName,
        packageName,
        commandName,
        startOptions: {
          baseBlueprint: {
            version: baseVersion,
            isBaseBlueprint: true
          },
          blueprint: {
            name: blueprint,
            version: startVersion
          },
          packageRange: '>=3.11.0-beta.1'
        },
        endOptions: {
          baseBlueprint: {
            version: baseVersion,
            isBaseBlueprint: true
          },
          blueprint: {
            name: blueprint,
            version: endVersion
          },
          packageRange: '>=3.11.0-beta.1'
        }
      });
    });

    it('can create a base project from cache', async function() {
      let { createProjectFromCache } = getStartAndEndCommands();

      let createProject = createProjectFromCache({
        packageRoot,
        options: {
          projectName,
          blueprint: loadSafeBlueprint({
            path: blueprintPath,
            isBaseBlueprint: true
          })
        }
      });

      sinon.stub(utils, 'require')
        .withArgs(path.join(blueprintPath, 'package'))
        .returns({ keywords: ['ember-blueprint'] });

      expect(await createProject(cwd)).to.equal(projectRoot);

      expect(spawnStub.args).to.deep.equal([[
        'node',
        [
          path.normalize(`${packageRoot}/bin/ember`),
          'new',
          projectName,
          '-sg',
          '-sn',
          '-sb',
          '-b',
          blueprintPath
        ],
        {
          cwd
        }
      ]]);

      expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test spawn']]);

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        projectRoot
      }]]);
    });

    it('can create a partial project from cache', async function() {
      let { createProjectFromCache } = getStartAndEndCommands();

      let createProject = createProjectFromCache({
        packageRoot,
        options: {
          baseBlueprint: loadSafeBlueprint({
            path: blueprintPath,
            isBaseBlueprint: true
          }),
          projectName,
          blueprint: loadSafeBlueprint({
            path: blueprintPath
          })
        }
      });

      sinon.stub(utils, 'require')
        .withArgs(path.join(blueprintPath, 'package'))
        .returns({ keywords: ['ember-blueprint'] });

      expect(await createProject(cwd)).to.equal(projectRoot);

      expect(spawnStub.args).to.deep.equal([
        [
          'node',
          [
            path.normalize(`${packageRoot}/bin/ember`),
            'new',
            projectName,
            '-sg',
            '-sn',
            '-sb',
            '-b',
            blueprintPath
          ],
          {
            cwd
          }
        ],
        [
          'node',
          [
            path.normalize(`${packageRoot}/bin/ember`),
            'init',
            '-sn',
            '-sb',
            '-b',
            blueprintPath
          ],
          {
            cwd: projectRoot
          }
        ]
      ]);

      expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test spawn'], ['test spawn']]);

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        projectRoot
      }]]);
    });

    it('can create a base project from remote', async function() {
      let { createProjectFromRemote } = getStartAndEndCommands();

      let createProject = createProjectFromRemote({
        options: {
          projectName,
          blueprint: loadSafeBlueprint({
            path: blueprintPath,
            isBaseBlueprint: true
          })
        }
      });

      sinon.stub(utils, 'require')
        .withArgs(path.join(blueprintPath, 'package'))
        .returns({ keywords: ['ember-blueprint'] });

      expect(await createProject(cwd)).to.equal(projectRoot);

      expect(npxStub.args).to.deep.equal([[
        [
          packageName,
          'new',
          projectName,
          '-sg',
          '-sn',
          '-sb',
          '-b',
          blueprintPath
        ],
        {
          cwd
        }
      ]]);

      expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test npx']]);

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        projectRoot
      }]]);
    });

    it('can create a partial project from remote', async function() {
      let { createProjectFromRemote } = getStartAndEndCommands();

      let createProject = createProjectFromRemote({
        options: {
          baseBlueprint: loadSafeBlueprint({
            path: blueprintPath,
            isBaseBlueprint: true
          }),
          projectName,
          blueprint: loadSafeBlueprint({
            path: blueprintPath
          })
        }
      });

      sinon.stub(utils, 'require')
        .withArgs(path.join(blueprintPath, 'package'))
        .returns({ keywords: ['ember-blueprint'] });

      expect(await createProject(cwd)).to.equal(projectRoot);

      expect(npxStub.args).to.deep.equal([
        [
          [
            packageName,
            'new',
            projectName,
            '-sg',
            '-sn',
            '-sb',
            '-b',
            blueprintPath
          ],
          {
            cwd
          }
        ],
        [
          [
            packageName,
            'init',
            '-sn',
            '-sb',
            '-b',
            blueprintPath
          ],
          {
            cwd: projectRoot
          }
        ]
      ]);

      expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test npx'], ['test npx']]);

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        projectRoot
      }]]);
    });

    it('can install an addon blueprint from cache', async function() {
      let { createProjectFromCache } = getStartAndEndCommands();

      readdirStub.resolves([]);

      let createProject = createProjectFromCache({
        packageRoot,
        options: {
          baseBlueprint,
          projectName,
          blueprint: loadSafeBlueprint({
            path: blueprintPath
          })
        }
      });

      sinon.stub(utils, 'require')
        .withArgs(path.join(blueprintPath, 'package'))
        .returns({ keywords: ['ember-addon'] });

      expect(await createProject(cwd)).to.equal(projectRoot);

      expect(spawnStub.args).to.deep.equal([
        [
          'node',
          [
            path.normalize(`${packageRoot}/bin/ember`),
            'new',
            projectName,
            '-sg',
            '-sn',
            '-sb',
            '-b',
            baseBlueprint.name,
            ...baseBlueprint.options
          ],
          {
            cwd
          }
        ]
      ]);

      expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test spawn']]);

      expect(installAddonBlueprintStub.args).to.deep.equal([[{
        projectRoot,
        blueprint: {
          path: blueprintPath,
          options: []
        }
      }]]);

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        projectRoot
      }]]);
    });

    it('can install an addon blueprint from remote', async function() {
      let { createProjectFromRemote } = getStartAndEndCommands();

      readdirStub.resolves([]);

      let createProject = createProjectFromRemote({
        options: {
          baseBlueprint,
          projectName,
          blueprint: loadSafeBlueprint({
            path: blueprintPath
          })
        }
      });

      sinon.stub(utils, 'require')
        .withArgs(path.join(blueprintPath, 'package'))
        .returns({ keywords: ['ember-addon'] });

      expect(await createProject(cwd)).to.equal(projectRoot);

      expect(npxStub.args).to.deep.equal([
        [
          [
            '-p',
            `${baseBlueprint.packageName}@${baseBlueprint.version}`,
            commandName,
            'new',
            projectName,
            '-sg',
            '-sn',
            '-sb',
            '-b',
            baseBlueprint.name,
            ...baseBlueprint.options
          ],
          {
            cwd
          }
        ]
      ]);

      expect(overwriteBlueprintFilesStub.args).to.deep.equal([['test npx']]);

      expect(installAddonBlueprintStub.args).to.deep.equal([[{
        projectRoot,
        blueprint: {
          path: blueprintPath,
          options: []
        }
      }]]);

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        projectRoot
      }]]);
    });
  });

  describe('init blueprint', function() {
    it('returns an options object - default', function() {
      let options = getStartAndEndCommands({
        startBlueprint: null
      });

      expect(options.createProjectFromCache).to.be.a('function');
      expect(options.createProjectFromRemote).to.be.a('function');

      delete options.createProjectFromCache;
      delete options.createProjectFromRemote;

      expect(options).to.deep.equal({
        projectName,
        packageName,
        commandName,
        startOptions: {
          baseBlueprint: undefined,
          blueprint: null,
          packageRange: null
        },
        endOptions: {
          baseBlueprint: undefined,
          blueprint: defaultEndBlueprint,
          packageRange: endVersion
        }
      });
    });

    it('returns an options object - custom', async function() {
      let options = getStartAndEndCommands({
        baseBlueprint,
        startBlueprint: null,
        endBlueprint: {
          name: blueprint,
          version: endVersion
        }
      });

      expect(options.createProjectFromCache).to.be.a('function');
      expect(options.createProjectFromRemote).to.be.a('function');

      delete options.createProjectFromCache;
      delete options.createProjectFromRemote;

      expect(options).to.deep.equal({
        projectName,
        packageName,
        commandName,
        startOptions: {
          baseBlueprint,
          blueprint: null,
          packageRange: baseVersion
        },
        endOptions: {
          baseBlueprint,
          blueprint: {
            name: blueprint,
            version: endVersion
          },
          packageRange: baseVersion
        }
      });
    });
  });

  describe(_getArgs, function() {
    function getArgs(options) {
      return _getArgs({
        projectName,
        directoryName: projectName,
        ...options
      });
    }

    it('works for default app', function() {
      let blueprint = loadDefaultBlueprint(['welcome']);

      let args = getArgs({
        blueprint
      });

      expect(args).to.deep.equal([
        'new',
        projectName,
        '-sg',
        '-sn',
        '-sb',
        '-b',
        'app'
      ]);
    });

    it('works for default addon', function() {
      let blueprint = loadDefaultBlueprint(['addon']);

      let args = getArgs({
        blueprint
      });

      expect(args).to.deep.equal([
        'new',
        projectName,
        '-sg',
        '-sn',
        '-sb',
        '-b',
        'addon',
        '--no-welcome'
      ]);
    });

    it('works for scoped project - base', function() {
      let blueprint = loadDefaultBlueprint(['welcome']);

      let args = getArgs({
        projectName: `@my-scope/${projectName}`,
        blueprint
      });

      expect(args).to.deep.equal([
        'new',
        `@my-scope/${projectName}`,
        `-dir=${projectName}`,
        '-sg',
        '-sn',
        '-sb',
        '-b',
        'app'
      ]);
    });

    it('works for scoped project - partial', function() {
      let blueprint = loadSafeBlueprint({
        path: '/path/to/my-blueprint'
      });

      let args = getArgs({
        projectName: `@my-scope/${projectName}`,
        blueprint
      });

      expect(args).to.deep.equal([
        'init',
        `--name=@my-scope/${projectName}`,
        '-sn',
        '-sb',
        '-b',
        '/path/to/my-blueprint'
      ]);
    });

    it('works for custom base blueprint', function() {
      let blueprint = loadSafeBlueprint({
        path: '/path/to/my-blueprint',
        isBaseBlueprint: true
      });

      let args = getArgs({
        blueprint
      });

      expect(args).to.deep.equal([
        'new',
        projectName,
        '-sg',
        '-sn',
        '-sb',
        '-b',
        '/path/to/my-blueprint'
      ]);
    });

    it('works for custom partial blueprint', function() {
      let blueprint = loadSafeBlueprint({
        path: '/path/to/my-blueprint'
      });

      let args = getArgs({
        blueprint
      });

      expect(args).to.deep.equal([
        'init',
        '-sn',
        '-sb',
        '-b',
        '/path/to/my-blueprint'
      ]);
    });

    it('handles options', function() {
      let blueprint = {
        ...loadDefaultBlueprint(['welcome']),
        options: [
          '--my-option-1',
          '--my-option-2'
        ]
      };

      let args = getArgs({
        blueprint
      });

      expect(args).to.deep.equal([
        'new',
        projectName,
        '-sg',
        '-sn',
        '-sb',
        '-b',
        'app',
        '--my-option-1',
        '--my-option-2'
      ]);
    });
  });
});
