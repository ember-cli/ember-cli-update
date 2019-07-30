'use strict';

const path = require('path');
const utils = require('./utils');

module.exports = function getStartAndEndCommands({
  packageJson: { name: projectName },
  projectOptions,
  startVersion,
  endVersion,
  blueprint
}) {
  let options = '-sn -sg';

  if (projectOptions.includes('yarn')) {
    options += ' --yarn';
  }

  if (!projectOptions.includes('welcome')) {
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
    packageName: 'ember-cli',
    commandName: 'ember',
    blueprint,
    // `createProjectFromCache` no longer works with blueprints.
    // It will look for an `ember-cli` version with the same
    // version as the blueprint.
    createProjectFromCache: createProjectFromCache(command),
    createProjectFromRemote: createProjectFromRemote(command),
    startOptions: {
      packageVersion: startVersion
    },
    endOptions: {
      packageVersion: endVersion
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
      let npxCommand;
      if (options.blueprint) {
        let blueprint = await utils.downloadBlueprint(
          options.blueprint.name,
          options.blueprint.url,
          options.packageVersion
        );

        npxCommand = `ember-cli ${command} -b ${blueprint.path}`;
        // npxCommand = `-p github:ember-cli/ember-cli#cfb9780 ember ${command} -b ${options.blueprint.name}@${options.packageVersion}`;
      } else {
        npxCommand = `-p ember-cli@${options.packageVersion} ember ${command}`;
      }

      await utils.npx(npxCommand, { cwd });

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
