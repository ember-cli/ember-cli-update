'use strict';

const utils = require('./utils');

module.exports = function runCodemod(codemod) {
  return codemod.commands.reduce((promise, command) => {
    return promise.then(() => {
      return utils.npx(command).catch(() => {});
    });
  }, Promise.resolve());
};
