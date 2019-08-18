'use strict';

const path = require('path');
const fs = require('fs-extra');
const utils = require('./utils');

const nodeModulesIgnore = `

/node_modules/
`;

module.exports = function getStartAndEndCommands({
  packageJson: { name: projectName },
  projectOptions,
  startVersion,
  endVersion,
  startBlueprint,
  endBlueprint
}) {
  let options = '-sn -sg';

  if (projectOptions.includes('yarn')) {
    options += ' --yarn';
  }

  if (!projectOptions.includes('welcome') && !projectOptions.includes('blueprint')) {
    options += ' --no-welcome';
  }

  let command;
  if (projectOptions.includes('app') || projectOptions.includes('blueprint')) {
    command = `new ${projectName} ${options}`;
  } else if (projectOptions.includes('addon')) {
    command = `addon ${projectName} ${options}`;
  } else if (projectOptions.includes('glimmer')) {
    // ember-cli doesn't have a way to use non-latest blueprint versions
    throw 'cannot checkout older versions of glimmer blueprint';
  }

  return {
    projectName,
    projectOptions,
    ...projectOptions.includes('blueprint') ? {} : {
      packageName: 'ember-cli',
      commandName: 'ember',
      // `createProjectFromCache` no longer works with custom blueprints.
      // It would look for an `ember-cli` version with the same version
      // as the blueprint.
      createProjectFromCache: createProjectFromCache(command)
    },
    createProjectFromRemote: createProjectFromRemote(command),
    startOptions: {
      packageVersion: startVersion,
      blueprint: startBlueprint
    },
    endOptions: {
      packageVersion: endVersion,
      blueprint: endBlueprint
    }
  };
};

function createProjectFromCache(command) {
  return function createProjectFromCache({
    packageRoot,
    options
  }) {
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
  };
}

function createProjectFromRemote(command) {
  return function createProjectFromRemote({
    options
  }) {
    return async function createProject(cwd) {
      if (options.blueprint.name !== 'ember-cli') {
        await utils.npx(`ember-cli ${command} -b ${options.blueprint.path}`, { cwd });
        // await utils.npx(`-p github:ember-cli/ember-cli#cfb9780 ember ${command} -b ${options.blueprint.name}@${options.packageVersion}`, { cwd });

        await module.exports.appendNodeModulesIgnore({
          cwd,
          projectName: options.projectName
        });
      } else {
        await utils.npx(`-p ember-cli@${options.packageVersion} ember ${command}`, { cwd });
      }

      return postCreateProject({
        cwd,
        options
      });
    };
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
