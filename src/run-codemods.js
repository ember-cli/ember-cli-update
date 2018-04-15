'use strict';

const utils = require('./utils');
const getApplicableCodemods = require('./get-applicable-codemods');

module.exports = function runCodemods(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;

  return getApplicableCodemods({
    projectType,
    startVersion
  }).then(codemods => {
    return Object.keys(codemods).reduce((promise, codemod) => {
      return codemods[codemod].commands.reduce((promise, command) => {
        return promise.then(() => {
          return utils.npx(command).catch(() => {});
        });
      }, promise);
    }, Promise.resolve());
  }).then(() => {
    return utils.run('git add -A');
  });
};
