'use strict';

const utils = require('./utils');
const semver = require('semver');

module.exports = function getApplicableCodemods(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;

  return utils.getCodemods().then(codemods => {
    return Object.keys(codemods).filter(codemod => {
      codemod = codemods[codemod];
      let isVersionInRange = semver.gte(startVersion, codemod.version);
      let isCorrectProjectType = codemod.projectTypes.indexOf(projectType) !== -1;
      return isVersionInRange && isCorrectProjectType;
    }).reduce((applicableCodemods, codemod) => {
      applicableCodemods[codemod] = codemods[codemod];
      return applicableCodemods;
    }, {});
  });
};
