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
  getArgs
} = _getStartAndEndCommands;

const projectName = 'my-custom-app';
const startVersion = '0.0.1';
const endVersion = '0.0.2';
const packageRoot = '/test/package/root';
const packageVersion = startVersion;
const cwd = '/test/cwd';
const packageName = 'ember-cli';
const commandName = 'ember';
const blueprint = 'test-blueprint';
const blueprintPath = '/path/to/blueprint';
const projectPath = path.normalize(`${cwd}/${projectName}`);
const baseBlueprint = loadDefaultBlueprint([], '0.0.3');
const defaultStartBlueprint = loadDefaultBlueprint([], startVersion);
const defaultEndBlueprint = loadDefaultBlueprint([], endVersion);

describe(_getStartAndEndCommands, function() {
  let npxStub;
  let spawnStub;
  let readdirStub;
  let installAddonBlueprintStub;
  let appendNodeModulesIgnoreStub;

  beforeEach(function() {
    npxStub = sinon.stub(_getStartAndEndCommands, 'npx').resolves();
    spawnStub = sinon.stub(_getStartAndEndCommands, 'spawn').resolves();
    readdirStub = sinon.stub(utils, 'readdir').resolves(['foo']);
    installAddonBlueprintStub = sinon.stub(_getStartAndEndCommands, 'installAddonBlueprint').resolves();
    appendNodeModulesIgnoreStub = sinon.stub(_getStartAndEndCommands, 'appendNodeModulesIgnore').resolves();
  });

  afterEach(function() {
    sinon.restore();
  });

  function getStartAndEndCommands(options) {
    return _getStartAndEndCommands(Object.assign({
      packageJson: { name: projectName },
      baseBlueprint,
      startBlueprint: defaultStartBlueprint,
      endBlueprint: defaultEndBlueprint
    }, options));
  }

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
        baseBlueprint,
        blueprint: defaultStartBlueprint,
        packageRange: startVersion
      },
      endOptions: {
        baseBlueprint,
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

    expect(await createProject(cwd)).to.equal(projectPath);

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

    expect(await createProject(cwd)).to.equal(projectPath);

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
          cwd: projectPath
        }
      ]
    ]);
  });

  it('can create a base project from remote', async function() {
    let { createProjectFromRemote } = getStartAndEndCommands();

    let createProject = createProjectFromRemote({
      options: {
        projectName,
        blueprint: loadDefaultBlueprint(['welcome'], packageVersion)
      }
    });

    expect(await createProject(cwd)).to.equal(projectPath);

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

    expect(await createProject(cwd)).to.equal(projectPath);

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
          cwd: projectPath
        }
      ]
    ]);
  });

  describe('custom blueprint', function() {
    it('returns an options object', async function() {
      let options = getStartAndEndCommands({
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
          packageRange: ''
        },
        endOptions: {
          baseBlueprint,
          blueprint: {
            name: blueprint,
            version: endVersion
          },
          packageRange: ''
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

      expect(await createProject(cwd)).to.equal(projectPath);

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

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        cwd,
        projectName
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

      expect(await createProject(cwd)).to.equal(projectPath);

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
            cwd: projectPath
          }
        ]
      ]);

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        cwd,
        projectName
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

      expect(await createProject(cwd)).to.equal(projectPath);

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

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        cwd,
        projectName
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

      expect(await createProject(cwd)).to.equal(projectPath);

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
            cwd: projectPath
          }
        ]
      ]);

      expect(installAddonBlueprintStub).to.not.be.called;

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        cwd,
        projectName
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

      expect(await createProject(cwd)).to.equal(projectPath);

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

      expect(installAddonBlueprintStub.args).to.deep.equal([[{
        cwd,
        projectName,
        blueprint: {
          path: blueprintPath,
          options: []
        }
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

      expect(await createProject(cwd)).to.equal(projectPath);

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

      expect(installAddonBlueprintStub.args).to.deep.equal([[{
        cwd,
        projectName,
        blueprint: {
          path: blueprintPath,
          options: []
        }
      }]]);

      expect(appendNodeModulesIgnoreStub.args).to.deep.equal([[{
        cwd,
        projectName
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
          baseBlueprint,
          blueprint: null,
          packageRange: null
        },
        endOptions: {
          baseBlueprint,
          blueprint: defaultEndBlueprint,
          packageRange: endVersion
        }
      });
    });

    it('returns an options object - custom', async function() {
      let options = getStartAndEndCommands({
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
          packageRange: ''
        },
        endOptions: {
          baseBlueprint,
          blueprint: {
            name: blueprint,
            version: endVersion
          },
          packageRange: ''
        }
      });
    });
  });

  describe(getArgs, function() {
    let projectName = 'my-project';

    it('works for default app', function() {
      let blueprint = loadDefaultBlueprint(['welcome']);

      let args = getArgs(projectName, blueprint);

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

      let args = getArgs(projectName, blueprint);

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

    it('works for custom base blueprint', function() {
      let blueprint = loadSafeBlueprint({
        path: '/path/to/my-blueprint',
        isBaseBlueprint: true
      });

      let args = getArgs(projectName, blueprint);

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

      let args = getArgs(projectName, blueprint);

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

      let args = getArgs(projectName, blueprint);

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
