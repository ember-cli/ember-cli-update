'use strict';

const path = require('path');
const npx = require('./npx');
const denodeify = require('denodeify');
const tmpDir = denodeify(require('tmp').dir);
const cpr = path.resolve(path.dirname(require.resolve('cpr')), '../bin/cpr');

module.exports = function getStartAndEndCommands({
  projectType,
  startVersion,
  endVersion
}) {
  let projectName;
  let command;
  switch (projectType) {
    case 'app':
      projectName = 'my-app';
      command = `new ${projectName}`;
      break;
    case 'addon':
      projectName = 'my-addon';
      command = `addon ${projectName}`;
      break;
    case 'glimmer':
      // projectName = 'my-app';
      // command = `new ${projectName} -b @glimmer/blueprint`;
      // break;
      throw 'cannot checkout older versions of glimmer blueprint';
  }

  function createCommand(version) {
    return tmpDir().then(cwd => {
      return npx(`-p ember-cli@${version} ember ${command} -sn -sg`, { cwd }).then(() => {
        return path.resolve(cwd, projectName);
      });
    }).then(appPath => {
      return `node ${cpr} ${appPath} .`;
    });
  }

  return Promise.all([
    createCommand(startVersion),
    createCommand(endVersion)
  ]).then(([
    startCommand,
    endCommand
  ]) => ({
    startCommand,
    endCommand
  }));
};
