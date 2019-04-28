'use strict';

const path = require('path');
const utils = require('./utils');

module.exports = function getStartAndEndCommands({
  packageJson: { name: projectName },
  projectOptions,
  startVersion,
  endVersion
}) {
  let options = '-sn -sg';

  if (projectOptions.includes('yarn')) {
    options += ' --yarn';
  }

  if (!projectOptions.includes('welcome')) {
    options += ' --no-welcome';
  }

  let command;
  if (projectOptions.includes('app')) {
    command = `new ${projectName} ${options}`;
  } else if (projectOptions.includes('addon')) {
    command = `addon ${projectName} ${options}`;
  } else if (projectOptions.includes('glimmer')) {
    // command = `new ${projectName} -b @glimmer/blueprint ${options}`;
    // ember-cli doesn't have a way to use non-latest blueprint versions
    throw 'cannot checkout older versions of glimmer blueprint';
  }

  return {
    projectName,
    projectOptions,
    packageName: 'ember-cli',
    commandName: 'ember',
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
      await utils.npx(`-p ember-cli@${options.packageVersion} ember ${command}`, { cwd });

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
