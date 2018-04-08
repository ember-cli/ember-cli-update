'use strict';

const semver = require('semver');

module.exports = function getApplicableCodemods(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;
  let getCodemods = options.getCodemods;

  return getCodemods().then(codemods => {
    return Object.keys(codemods).filter(codemod => {
      return semver.gte(startVersion, codemods[codemod].version) &&
        codemods[codemod].projectTypes.indexOf(projectType) !== -1;
    }).reduce((applicableCodemods, codemod) => {
      applicableCodemods[codemod] = codemods[codemod];
      return applicableCodemods;
    }, {});
  });
};
