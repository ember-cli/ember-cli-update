'use strict';

const path = require('path');
const fs = require('fs-extra');
const run = require('./run');
const utils = require('./utils');
const loadDefaultBlueprint = require('./load-default-blueprint');
const isDefaultBlueprint = require('./is-default-blueprint');

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
      let args = getArgs(options.projectName, options.blueprint);

      await runEmberLocally({
        packageRoot,
        args,
        cwd
      });

      let isCustomBlueprint = !isDefaultBlueprint(options.blueprint);

      if (isCustomBlueprint) {
        await postCreateCustomBlueprint({
          cwd,
          packageRoot,
          options
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
      let command = getArgs(options.projectName, options.blueprint).join(' ');

      let isCustomBlueprint = !isDefaultBlueprint(options.blueprint);

      if (isCustomBlueprint) {
        await utils.npx(`ember-cli ${command}`, { cwd });
        // await utils.npx(`-p github:ember-cli/ember-cli#cfb9780 ember new ${options.projectName} -sn -sg -b ${options.blueprint.name}@${options.blueprint.version}`, { cwd });

        await postCreateCustomBlueprint({
          cwd,
          options
        });
      } else {
        await utils.npx(`-p ember-cli@${options.blueprint.version} ember ${command}`, { cwd });
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

async function postCreateCustomBlueprint({
  cwd,
  packageRoot,
  options
}) {
  // This means it's not a full app blueprint, but a default blueprint of an addon.
  // There may be a faster way to detect this.
  let files = await utils.readdir(path.join(cwd, options.projectName));
  if (!files.length) {
    await module.exports.installAddonBlueprint({
      cwd,
      packageRoot,
      projectName: options.projectName,
      blueprint: options.blueprint
    });
  }

  await module.exports.appendNodeModulesIgnore({
    cwd,
    projectName: options.projectName
  });
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

  // https://github.com/ember-cli/ember-cli/issues/8937
  // await utils.npx(`--no-install ember install ${blueprint.path}`, { cwd: projectRoot });

  await run(`npm install ${blueprint.path}`, { cwd: projectRoot });

  await utils.npx(`--no-install ember g ${blueprint.packageName}`, { cwd: projectRoot });

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
