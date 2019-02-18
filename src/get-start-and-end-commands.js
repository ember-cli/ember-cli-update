'use strict';

const path = require('path');
const utils = require('./utils');
const { spawn } = require('child_process');

module.exports = function getStartAndEndCommands({
  projectName,
  projectOptions,
  startVersion,
  endVersion
}) {
  let options = '-sn -sg';

  let command;
  if (projectOptions.includes('app')) {
    command = `new ${projectName} ${options}`;
  } else if (projectOptions.includes('addon')) {
    command = `addon ${projectName} ${options}`;
  } else if (projectOptions.includes('glimmer')) {
    // command = `new ${projectName} -b @glimmer/blueprint ${options}`;
    // break;
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
    return function createProject(cwd) {
      let ps = spawn('node', [
        path.join(packageRoot, 'bin/ember'),
        ...command.split(' ')
      ], {
        cwd
      });

      return new Promise(resolve => {
        ps.on('exit', resolve);
      }).then(() => {
        return postCreateProject({
          cwd,
          options
        });
      });
    };
  };
}

function createProjectFromRemote(command) {
  return function createProjectFromRemote({
    options
  }) {
    return function createProject(cwd) {
      return utils.npx(`-p ember-cli@${options.packageVersion} ember ${command}`, { cwd }).then(() => {
        return postCreateProject({
          cwd,
          options
        });
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
  return Promise.resolve(path.join(cwd, projectName));
}
