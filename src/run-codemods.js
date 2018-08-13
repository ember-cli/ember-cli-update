'use strict';

const utils = require('./utils');

module.exports = function runCodemods(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;

  return utils.getApplicableCodemods({
    projectType,
    startVersion
  }).then(codemods => {
    return Object.keys(codemods).reduce((promise, codemod) => {
      return promise.then(() => {
        return utils.runCodemod(codemods[codemod]);
      });
    }, Promise.resolve());
  }).then(() => {
    return utils.run('git add -A');
  });
};
