'use strict';

const path = require('path');
const fs = require('fs-extra');
const run = require('./run');
const utils = require('./utils');
const loadDefaultBlueprint = require('./load-default-blueprint');
const isDefaultBlueprint = require('./is-default-blueprint');
const emberInstallAddon = require('./ember-install-addon');
const overwriteBlueprintFiles = require('./overwrite-blueprint-files');

const nodeModulesIgnore = `

/node_modules/
`;

module.exports = function getStartAndEndCommands({
  packageJson: { name: projectName },
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
      blueprint: startBlueprint,

      // for cache detection logic
      packageRange: startRange
    },
    endOptions: {
      blueprint: endBlueprint,

      // for cache detection logic
      packageRange: endRange
    }
  };
};

function getArgs(projectName, blueprint) {
  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  let _blueprint;
  if (isCustomBlueprint) {
    _blueprint = blueprint.path;
  } else {
    // Can we use the above path all the time, even if it is default?
    _blueprint = blueprint.name;
  }

  return [
    'new',
    projectName,
    '-sn',
    '-sb',
    '-sg',
    '-b',
    _blueprint,
    ...blueprint.options
  ];
}

async function runEmberLocally({
  packageRoot,
  args,
  cwd
}) {
  await utils.spawn('node', [
    path.join(packageRoot, 'bin/ember'),
    ...args
  ], {
    cwd
  });
}

function createProjectFromCache({
  packageRoot,
  options
}) {
  return async function createProject(cwd) {
    if (options.blueprint) {
      let isCustomBlueprint = !isDefaultBlueprint(options.blueprint);

      let isDefaultAddonBlueprint;

      if (isCustomBlueprint) {
        let { keywords } = utils.require(path.join(options.blueprint.path, 'package'));

        isDefaultAddonBlueprint = !(keywords && keywords.includes('ember-blueprint'));
      }

      if (isDefaultAddonBlueprint) {
        await module.exports.installAddonBlueprint({
          cwd,
          packageRoot,
          projectName: options.projectName,
          blueprint: options.blueprint
        });
      } else {
        let args = getArgs(options.projectName, options.blueprint);

        await runEmberLocally({
          packageRoot,
          args,
          cwd
        });
      }

      if (isCustomBlueprint) {
        await module.exports.appendNodeModulesIgnore({
          cwd,
          projectName: options.projectName
        });
      }
    } else {
      // We are doing a blueprint init, and need an empty first commit.
      await module.exports.createEmptyCommit({
        cwd,
        projectName: options.projectName
      });
    }

    return postCreateProject({
      cwd,
      options
    });
  };
}

function createProjectFromRemote({
  options
}) {
  return async function createProject(cwd) {
    if (options.blueprint) {
      let isCustomBlueprint = !isDefaultBlueprint(options.blueprint);

      let isDefaultAddonBlueprint;

      if (isCustomBlueprint) {
        let { keywords } = utils.require(path.join(options.blueprint.path, 'package'));

        isDefaultAddonBlueprint = !(keywords && keywords.includes('ember-blueprint'));
      }

      if (isDefaultAddonBlueprint) {
        await module.exports.installAddonBlueprint({
          cwd,
          projectName: options.projectName,
          blueprint: options.blueprint
        });
      } else {
        let command = getArgs(options.projectName, options.blueprint).join(' ');

        if (isCustomBlueprint) {
          await utils.npx(`ember-cli ${command}`, { cwd });
          // await utils.npx(`-p github:ember-cli/ember-cli#cfb9780 ember new ${options.projectName} -sn -sg -b ${options.blueprint.name}@${options.blueprint.version}`, { cwd });
        } else {
          await utils.npx(`-p ember-cli@${options.blueprint.version} ember ${command}`, { cwd });
        }
      }

      if (isCustomBlueprint) {
        await module.exports.appendNodeModulesIgnore({
          cwd,
          projectName: options.projectName
        });
      }
    } else {
      // We are doing a blueprint init, and need an empty first commit.
      await module.exports.createEmptyCommit({
        cwd,
        projectName: options.projectName
      });
    }

    return postCreateProject({
      cwd,
      options
    });
  };
}

function postCreateProject({
  cwd,
  options: {
    projectName
  }
}) {
  return path.join(cwd, projectName);
}

module.exports.installAddonBlueprint = async function installAddonBlueprint({
  cwd,
  packageRoot,
  projectName,
  blueprint
}) {
  let defaultBlueprint = loadDefaultBlueprint();

  let args = getArgs(projectName, defaultBlueprint);

  let projectRoot = path.join(cwd, projectName);

  await fs.remove(projectRoot);

  if (packageRoot) {
    await runEmberLocally({
      packageRoot,
      args,
      cwd
    });
  } else {
    let command = args.join(' ');

    await utils.npx(`ember-cli ${command}`, { cwd });
  }

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

module.exports.createEmptyCommit = async function createEmptyCommit({
  cwd,
  projectName
}) {
  await fs.mkdir(path.join(cwd, projectName));
  await appendNodeModulesIgnore({
    cwd,
    projectName
  });
};

async function appendNodeModulesIgnore({
  cwd,
  projectName
}) {
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
