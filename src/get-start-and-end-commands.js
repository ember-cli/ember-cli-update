'use strict';

const path = require('path');
const utils = require('./utils');
const denodeify = require('denodeify');
const tmpDir = denodeify(require('tmp').dir);
const cpr = path.resolve(path.dirname(require.resolve('cpr')), '../bin/cpr');
const resolve = denodeify(require('resolve'));

module.exports = function getStartAndEndCommands({
  projectName,
  projectType,
  startVersion,
  endVersion
}) {
  let command;
  switch (projectType) {
    case 'app':
      command = `new ${projectName}`;
      break;
    case 'addon':
      command = `addon ${projectName}`;
      break;
    case 'glimmer':
      // command = `new ${projectName} -b @glimmer/blueprint`;
      // break;
      // ember-cli doesn't have a way to use non-latest blueprint versions
      throw 'cannot checkout older versions of glimmer blueprint';
  }

  return Promise.all([
    module.exports.createLocalCommand(projectName, command, startVersion),
    module.exports.createRemoteCommand(projectName, command, endVersion)
  ]).then(([
    startCommand,
    endCommand
  ]) => ({
    startCommand,
    endCommand
  }));
};

function getCommand(cwd, projectName) {
  let appPath = path.resolve(cwd, projectName);
  return `node ${cpr} ${appPath} .`;
}

const options = '-sn -sg';

module.exports.createLocalCommand = function createLocalCommand(projectName, command, version) {
  return resolve('ember-cli', { basedir: process.cwd() }).then(emberCliPath => {
    let emberCliRoot = path.resolve(path.dirname(emberCliPath), '../..');
    let emberCliVersion = require(path.resolve(emberCliRoot, 'package.json')).version;
    if (emberCliVersion !== version) {
      // installed version is out-of-date
      return module.exports.createRemoteCommand(projectName, command, version);
    }
    return tmpDir().then(cwd => {
      utils.run(`node ${path.resolve(emberCliRoot, 'bin/ember')} ${command} ${options}`, { cwd });
      return getCommand(cwd, projectName);
    });
  }).catch(err => {
    if (err.code === 'MODULE_NOT_FOUND') {
      // no node_modules
      return module.exports.createRemoteCommand(projectName, command, version);
    }
    throw err;
  });
};

module.exports.createRemoteCommand = function createRemoteCommand(projectName, command, version) {
  return tmpDir().then(cwd => {
    return utils.npx(`-p ember-cli@${version} ember ${command} ${options}`, { cwd }).then(() => {
      return getCommand(cwd, projectName);
    });
  });
};
