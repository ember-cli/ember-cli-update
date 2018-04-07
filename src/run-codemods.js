'use strict';

const semver = require('semver');
const utils = require('./utils');
const codemods = require('./codemods');

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
