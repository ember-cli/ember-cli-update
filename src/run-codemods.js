'use strict';

const utils = require('./utils');

module.exports = function runCodemods(codemods) {
  return Object.keys(codemods).reduce((promise, codemod) => {
    return promise.then(() => {
      return utils.runCodemod(codemods[codemod]);
    });
  }, Promise.resolve()).then(() => {
    return utils.run('git add -A');
  });
};
