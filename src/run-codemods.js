'use strict';

const semver = require('semver');
const utils = require('./utils');

const codemods = {
  'ember-modules-codemod': {
    version: '2.16.0-beta.1',
    projectTypes: ['app', 'addon'],
    commands: ['ember-modules-codemod']
  }
};

module.exports = function runCodemods(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;

  return Promise.all(Object.keys(codemods).filter(codemod => {
    return semver.gte(startVersion, codemods[codemod].version) &&
      codemods[codemod].projectTypes.indexOf(projectType) !== -1;
  }).reduce((promises, codemod) => {
    return promises.concat(codemods[codemod].commands.map(utils.npx));
  }, [])).then(() => {
    return utils.run('git add -A');
  });
};
