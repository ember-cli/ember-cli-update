'use strict';

const path = require('path');
const fs = require('fs-extra');
const run = require('./run');
const utils = require('./utils');
const loadSafeBlueprint = require('./load-safe-blueprint');

const nodeModulesIgnore = `

/node_modules/
`;

module.exports = function getStartAndEndCommands({
  packageJson: { name: projectName },
  startBlueprint,
  endBlueprint
}) {
  let isCustomBlueprint = endBlueprint.name !== 'ember-cli';

  return {
    projectName,
    ...isCustomBlueprint ? {} : {
      packageName: 'ember-cli',
      commandName: 'ember',
      // `createProjectFromCache` no longer works with custom blueprints.
      // It would look for an `ember-cli` version with the same version
      // as the blueprint.
      createProjectFromCache
    },
    createProjectFromRemote,
    startOptions: {
      blueprint: startBlueprint
    },
    endOptions: {
      blueprint: endBlueprint
    }
  };
};

function buildCommand(projectName, blueprint) {
  let isCustomBlueprint = blueprint.name !== 'ember-cli';

  let command = 'new';
  if (blueprint.type === 'addon') {
    command = 'addon';
  }

  command += ` ${projectName} -sn -sg`;

  if (isCustomBlueprint) {
    command += ` -b ${blueprint.path}`;
  }

  if (blueprint.options.length) {
    command += ` ${blueprint.options.join(' ')}`;
  }

  return command;
}

function createProjectFromCache({
  packageRoot,
  options
}) {
  let command = buildCommand(options.projectName, options.blueprint);

  return async function createProject(cwd) {
    await utils.spawn('node', [
      path.join(packageRoot, 'bin/ember'),
      ...command.split(' ')
    ], {
      cwd
    });

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
      let command = buildCommand(options.projectName, options.blueprint);

      let isCustomBlueprint = options.blueprint.name !== 'ember-cli';

      if (isCustomBlueprint) {
        await utils.npx(`ember-cli ${command}`, { cwd });
        // await utils.npx(`-p github:ember-cli/ember-cli#cfb9780 ember new ${options.projectName} -sn -sg -b ${options.blueprint.name}@${options.blueprint.version}`, { cwd });

        // This means it's not a full app blueprint, but a default blueprint of an addon.
        // There may be a faster way to detect this.
        let files = await utils.readdir(path.join(cwd, options.projectName));
        if (!files.length) {
          await module.exports.installAddonBlueprint({
            cwd,
            projectName: options.projectName,
            blueprintPath: options.blueprint.path
          });
        }

        await module.exports.appendNodeModulesIgnore({
          cwd,
          projectName: options.projectName
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
  projectName,
  blueprintPath
}) {
  let defaultBlueprint = {
    name: 'ember-cli'
  };

  let command = buildCommand(projectName, loadSafeBlueprint(defaultBlueprint));

  await fs.remove(path.join(cwd, projectName));

  await utils.npx(`ember-cli ${command}`, { cwd });

  await run('npm install', { cwd: path.join(cwd, projectName) });

  await utils.npx(`--no-install ember install ${blueprintPath}`, { cwd: path.join(cwd, projectName) });

  await fs.remove(path.join(cwd, projectName, 'package-lock.json'));
};

module.exports.createEmptyCommit = async function createEmptyCommit({
  cwd,
  projectName
}) {
  await fs.mkdir(path.join(cwd, projectName));
  await fs.writeFile(path.join(cwd, projectName, 'package.json'), '{}');
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
