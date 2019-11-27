'use strict';

const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const run = require('./run');
const utils = require('./utils');
const isDefaultBlueprint = require('./is-default-blueprint');
const emberInstallAddon = require('./ember-install-addon');
const overwriteBlueprintFiles = require('./overwrite-blueprint-files');

const nodeModulesIgnore = `

/node_modules/
`;

module.exports = function getStartAndEndCommands({
  packageJson: { name: projectName },
  baseBlueprint,
  startBlueprint,
  endBlueprint
}) {
  let isCustomBlueprint = !isDefaultBlueprint(endBlueprint);

  let startRange;
  let endRange;
  if (isCustomBlueprint) {
    startRange = endRange = '';
  } else {
    startRange = startBlueprint && startBlueprint.version;
    endRange = endBlueprint.version;
  }

  return {
    projectName,
    packageName: 'ember-cli',
    commandName: 'ember',
    createProjectFromCache,
    createProjectFromRemote,
    startOptions: {
      baseBlueprint,
      blueprint: startBlueprint,

      // for cache detection logic
      packageRange: startRange
    },
    endOptions: {
      baseBlueprint,
      blueprint: endBlueprint,

      // for cache detection logic
      packageRange: endRange
    }
  };
};

function isDefaultAddonBlueprint(blueprint) {
  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  let isDefaultAddonBlueprint;

  if (isCustomBlueprint) {
    let { keywords } = utils.require(path.join(blueprint.path, 'package'));

    isDefaultAddonBlueprint = !(keywords && keywords.includes('ember-blueprint'));
  }

  return isDefaultAddonBlueprint;
}

function getArgs(projectName, blueprint) {
  let args = [];

  if (blueprint.isBaseBlueprint) {
    args.push('new');
    args.push(projectName);
    args.push('-sg');
  } else {
    args.push('init');
  }

  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  let _blueprint;
  if (isCustomBlueprint) {
    _blueprint = blueprint.path;
  } else {
    // Can we use the above path all the time, even if it is default?
    _blueprint = blueprint.name;
  }

  return [
    ...args,
    '-sn',
    '-sb',
    '-b',
    _blueprint,
    ...blueprint.options
  ];
}

module.exports.spawn = async function spawn(command, args, options) {
  let ps = execa(command, args, {
    stdio: ['pipe', 'pipe', 'inherit'],
    ...options
  });

  overwriteBlueprintFiles(ps);

  await ps;
};

async function runEmberLocally({
  packageRoot,
  cwd,
  projectName,
  blueprint
}) {
  let args = getArgs(projectName, blueprint);

  if (!blueprint.isBaseBlueprint) {
    cwd = path.join(cwd, projectName);
  }

  await module.exports.spawn('node', [
    path.join(packageRoot, 'bin/ember'),
    ...args
  ], { cwd });
}

function createProjectFromCache({
  packageRoot,
  options
}) {
  return async function createProject(cwd) {
    if (!options.blueprint || !options.blueprint.isBaseBlueprint) {
      await runEmberLocally({
        packageRoot,
        cwd,
        projectName: options.projectName,
        blueprint: options.baseBlueprint
      });
    }

    if (options.blueprint) {
      await runEmberLocally({
        packageRoot,
        cwd,
        projectName: options.projectName,
        blueprint: options.blueprint
      });
    }

    return await postCreateProject({
      cwd,
      options
    });
  };
}

module.exports.npx = async function npx(args, options) {
  let ps = utils.npx(args.join(' '), options);

  overwriteBlueprintFiles(ps);

  await ps;
};

async function runEmberRemotely({
  cwd,
  projectName,
  blueprint
}) {
  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  let args = getArgs(projectName, blueprint);

  if (!blueprint.isBaseBlueprint) {
    cwd = path.join(cwd, projectName);
  }

  if (isCustomBlueprint) {
    args = ['ember-cli', ...args];
    // args = ['-p', 'github:ember-cli/ember-cli#cfb9780', 'ember', 'new', projectName, '-sn', '-sg', '-b', `${blueprint.packageName}@${blueprint.version}`];
  } else {
    args = ['-p', `ember-cli@${blueprint.version}`, 'ember', ...args];
  }

  await module.exports.npx(args, { cwd });
}

function createProjectFromRemote({
  options
}) {
  return async function createProject(cwd) {
    if (!options.blueprint || !options.blueprint.isBaseBlueprint) {
      await runEmberRemotely({
        cwd,
        projectName: options.projectName,
        blueprint: options.baseBlueprint
      });
    }

    if (options.blueprint) {
      await runEmberRemotely({
        cwd,
        projectName: options.projectName,
        blueprint: options.blueprint
      });
    }

    return await postCreateProject({
      cwd,
      options
    });
  };
}

async function postCreateProject({
  cwd,
  options: {
    projectName,
    blueprint
  }
}) {
  if (blueprint && isDefaultAddonBlueprint(blueprint)) {
    await module.exports.installAddonBlueprint({
      cwd,
      projectName,
      blueprint
    });
  }

  if (!(blueprint && isDefaultBlueprint(blueprint))) {
    // This might not be needed anymore.
    await module.exports.appendNodeModulesIgnore({
      cwd,
      projectName
    });
  }

  return path.join(cwd, projectName);
}

module.exports.installAddonBlueprint = async function installAddonBlueprint({
  cwd,
  projectName,
  blueprint
}) {
  let projectRoot = path.join(cwd, projectName);

  // `not found: ember` without this
  await run('npm install', { cwd: projectRoot });

  let { ps } = await emberInstallAddon({
    cwd: projectRoot,
    addonName: blueprint.path,
    blueprintPackageName: blueprint.packageName,
    stdin: 'pipe'
  });

  overwriteBlueprintFiles(ps);

  await ps;

  let packageJson = await fs.readJson(path.join(projectRoot, 'package.json'));
  packageJson.devDependencies[blueprint.packageName] = blueprint.version;
  await fs.writeJson(path.join(projectRoot, 'package.json'), packageJson);

  await fs.remove(path.join(projectRoot, 'package-lock.json'));
};

async function appendNodeModulesIgnore({
  cwd,
  projectName
}) {
  if (!await fs.pathExists(path.join(cwd, projectName, 'node_modules'))) {
    return;
  }

  let isIgnoringNodeModules;
  let gitignore = '';
  try {
    gitignore = await fs.readFile(path.join(cwd, projectName, '.gitignore'), 'utf8');

    isIgnoringNodeModules = /^\/?node_modules\/?$/m.test(gitignore);
  } catch (err) {}
  if (!isIgnoringNodeModules) {
    await fs.writeFile(path.join(cwd, projectName, '.gitignore'), `${gitignore}${nodeModulesIgnore}`);
  }
}

module.exports.appendNodeModulesIgnore = appendNodeModulesIgnore;
module.exports.getArgs = getArgs;
