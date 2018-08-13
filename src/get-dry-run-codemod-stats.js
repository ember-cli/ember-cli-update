'use strict';

const utils = require('./utils');

module.exports = function getDryRunCodemodStats(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;

  return utils.getApplicableCodemods({
    projectType,
    startVersion
  }).then(codemods => {
    codemods = Object.keys(codemods).join(', ');
    return `Would run the following codemods: ${codemods}.`;
  });
};
