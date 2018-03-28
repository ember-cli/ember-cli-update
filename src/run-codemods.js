'use strict';

const semver = require('semver');
const utils = require('./utils');

const codemods = {
  'ember-modules-codemod': {
    version: '2.16.0-beta.1',
    projectTypes: ['app', 'addon'],
    commands: ['ember-modules-codemod']
  },
  'ember-qunit-codemod': {
    version: '3.0.0-beta.1',
    projectTypes: ['app', 'addon'],
    commands: ['jscodeshift -t https://rawgit.com/rwjblue/ember-qunit-codemod/master/ember-qunit-codemod.js ./tests/']
  }
};

module.exports = function runCodemods(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;

  return Object.keys(codemods).filter(codemod => {
    return semver.gte(startVersion, codemods[codemod].version) &&
      codemods[codemod].projectTypes.indexOf(projectType) !== -1;
  }).reduce((promise, codemod) => {
    return codemods[codemod].commands.reduce((promise, command) => {
      return promise.then(() => utils.npx(command));
    }, promise);
  }, Promise.resolve()).then(() => {
    return utils.run('git add -A');
  });
};
