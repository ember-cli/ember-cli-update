'use strict';

const getApplicableCodemods = require('./get-applicable-codemods');

module.exports = function getDryRunStats(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;
  let endVersion = options.endVersion;
  let runCodemods = options.runCodemods;
  let getCodemods = options.getCodemods;

  if (runCodemods) {
    return getApplicableCodemods({
      projectType,
      startVersion,
      getCodemods
    }).then(codemods => {
      codemods = Object.keys(codemods).join(', ');
      return `Would run the following codemods: ${codemods}.`;
    });
  }

  return Promise.resolve(
    `Would update from ${startVersion} to ${endVersion}.`
  );
};
