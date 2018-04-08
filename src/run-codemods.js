'use strict';

const utils = require('./utils');
const getApplicableCodemods = require('./get-applicable-codemods');

module.exports = function runCodemods(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;
  let getCodemods = options.getCodemods;

  return getApplicableCodemods({
    projectType,
    startVersion,
    getCodemods
  }).then(codemods => {
    return Object.keys(codemods).reduce((promise, codemod) => {
      return codemods[codemod].commands.reduce((promise, command) => {
        return promise.then(() => utils.npx(command));
      }, promise);
    }, Promise.resolve());
  }).then(() => {
    return utils.run('git add -A');
  });
};
